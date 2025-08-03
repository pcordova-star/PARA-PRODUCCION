'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, List, FileDown, Loader2 } from 'lucide-react';
import { ContractFormDialog } from '@/components/contracts/contract-form-dialog';
import type { Contract, Property, UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ContractsDataTable } from '@/components/contracts/contracts-data-table';
import { columns } from '@/components/contracts/contracts-columns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ContractCard } from '@/components/contracts/contract-card';
import Papa from 'papaparse';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { sendEmail } from '@/lib/notifications';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchContractsAndProperties = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      // Fetch Contracts
      const contractsQuery = query(
        collection(db, 'contracts'),
        where(currentUser.role === 'Arrendador' ? 'landlordId' : 'tenantId', '==', currentUser.uid)
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setContracts(contractsList);
      
      // Fetch Properties for the form (only if landlord)
      if (currentUser.role === 'Arrendador') {
        const propertiesQuery = query(collection(db, 'properties'), where('ownerUid', '==', currentUser.uid));
        const propertiesSnapshot = await getDocs(propertiesQuery);
        const propertiesList = propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Property));
        setUserProperties(propertiesList);
      }

    } catch (error) {
      console.error("Error fetching data: ", error);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron obtener los contratos o propiedades.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchContractsAndProperties();
  }, [fetchContractsAndProperties]);

  const handleSaveContract = async (values: any) => {
    if (!currentUser || currentUser.role !== 'Arrendador') {
        toast({ title: 'Acción no permitida', description: 'Solo los arrendadores pueden crear contratos.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);

    try {
      const propertyRef = doc(db, 'properties', values.propertyId);
      const propertySnap = await getDoc(propertyRef);
      if (!propertySnap.exists()) {
          throw new Error("Property not found");
      }
      const propertyData = propertySnap.data();

      if (selectedContract) {
        // Edit existing contract
        const contractRef = doc(db, 'contracts', selectedContract.id);
        await updateDoc(contractRef, {
            ...values,
            propertyAddress: propertyData.address,
            propertyName: `${propertyData.type} en ${propertyData.comuna}`,
        });
        toast({ title: 'Contrato actualizado', description: 'Los cambios se han guardado con éxito.' });
      } else {
        // Create new contract
        const newContractData = {
          ...values,
          landlordId: currentUser.uid,
          landlordName: currentUser.name,
          propertyAddress: propertyData.address,
          propertyName: `${propertyData.type} en ${propertyData.comuna}`,
          status: 'Borrador' as const,
        };
        await addDoc(collection(db, 'contracts'), newContractData);
        
        // Send email notification
        await sendEmail({
          to: values.tenantEmail,
          subject: `Nuevo Contrato de Arriendo de ${currentUser.name}`,
          html: `
            <h1>Hola ${values.tenantName},</h1>
            <p><strong>${currentUser.name}</strong> te ha enviado un nuevo contrato de arriendo para la propiedad ubicada en <strong>${propertyData.address}</strong>.</p>
            <p>Por favor, inicia sesión en S.A.R.A para revisar los detalles del contrato y aceptarlo.</p>
            <p>Gracias por usar S.A.R.A.</p>
          `,
        });

        toast({ title: 'Contrato creado', description: 'Se ha enviado una notificación al arrendatario.' });
      }

      fetchContractsAndProperties();
      setIsFormOpen(false);
      setSelectedContract(null);
    } catch (error) {
      console.error("Error saving contract:", error);
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar el contrato. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddNew = () => {
    setSelectedContract(null);
    setIsFormOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!contractToDelete) return;
    try {
        await deleteDoc(doc(db, 'contracts', contractToDelete.id));
        toast({ title: 'Contrato eliminado', description: `El contrato con ${contractToDelete.tenantName} ha sido eliminado.`, variant: 'destructive' });
        fetchContractsAndProperties();
        setIsDeleteDialogOpen(false);
        setContractToDelete(null);
    } catch (error) {
        console.error("Error deleting contract:", error);
        toast({
            title: 'Error al eliminar',
            description: 'No se pudo eliminar el contrato.',
            variant: 'destructive',
        });
    }
  };
  
  const handleExport = () => {
    const dataToExport = contracts.map(c => ({
      ID: c.id,
      Propiedad_Direccion: c.propertyAddress,
      Arrendatario: c.tenantName,
      RUT_Arrendatario: c.tenantRut,
      Email_Arrendatario: c.tenantEmail,
      Fecha_Inicio: c.startDate ? c.startDate.split('T')[0] : '',
      Fecha_Fin: c.endDate ? c.endDate.split('T')[0] : '',
      Monto_Arriendo: c.rentAmount,
      Estado: c.status,
      Uso_Propiedad: c.propertyUsage,
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sara_contratos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportación exitosa', description: 'El archivo de contratos ha sido descargado.' });
  };

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Contratos</h1>
          <p className="text-muted-foreground">
            Cree, envíe y administre sus contratos de arriendo.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={() => setViewMode('cards')} disabled={viewMode === 'cards'}>
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Vista de Tarjetas</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode('list')} disabled={viewMode === 'list'}>
                <List className="h-4 w-4" />
                <span className="sr-only">Vista de Lista</span>
            </Button>
             <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
            </Button>
            {currentUser?.role === 'Arrendador' && (
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Contrato
                </Button>
            )}
        </div>
      </div>

       {viewMode === 'cards' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {contracts.map(contract => (
                  <ContractCard 
                    key={contract.id} 
                    contract={contract} 
                    onEdit={() => handleEdit(contract)} 
                    onDelete={() => openDeleteDialog(contract)} 
                  />
              ))}
          </div>
       ) : (
          <ContractsDataTable 
            columns={columns({ onEdit: handleEdit, onDelete: openDeleteDialog })} 
            data={contracts} 
          />
       )}

       <ContractFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contract={selectedContract}
        onSave={handleSaveContract}
        userProperties={userProperties.filter(p => p.status !== 'Arrendada' || p.id === selectedContract?.propertyId)}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar este contrato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el contrato de sus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
