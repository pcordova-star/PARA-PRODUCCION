
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, List, FileDown, Loader2 } from 'lucide-react';
import { ContractFormDialog } from '@/components/contracts/contract-form-dialog';
import type { Contract, Property, UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ContractsDataTable } from '@/components/contracts/contracts-data-table';
import { columns as createColumns } from '@/components/contracts/contracts-columns';
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
      const userField = currentUser.role === 'Arrendador' ? 'landlordId' : 'tenantId';
      const contractsQuery = query(collection(db, 'contracts'), where(userField, '==', currentUser.uid));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setContracts(contractsList);
      
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
        // Edit existing contract (tenantId logic should be handled carefully here if needed)
        const contractRef = doc(db, 'contracts', selectedContract.id);
        await updateDoc(contractRef, {
            ...values,
            propertyAddress: propertyData.address,
            propertyName: `${propertyData.type} en ${propertyData.comuna}`,
        });
        toast({ title: 'Contrato actualizado', description: 'Los cambios se han guardado con éxito.' });
      } else {
        // Create new contract
        // Find tenant by email to get their UID
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", values.tenantEmail));
        const querySnapshot = await getDocs(q);
        
        let tenantId: string | null = null;
        if (!querySnapshot.empty) {
            tenantId = querySnapshot.docs[0].id;
        } else {
            toast({
                title: "Arrendatario no encontrado",
                description: `El usuario con email ${values.tenantEmail} no está registrado. Se enviará la invitación, pero deberá registrarse para ver el contrato.`,
                variant: "default"
            });
        }

        const newContractData = {
          ...values,
          landlordId: currentUser.uid,
          landlordName: currentUser.name,
          tenantId: tenantId, // Assign found tenantId or null
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
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h1 style="color: #2077c2; text-align: center;">¡Tienes un nuevo contrato de arriendo pendiente!</h1>
                <p>Hola ${values.tenantName},</p>
                <p><strong>${currentUser.name}</strong> te ha invitado a revisar y firmar un nuevo contrato de arriendo para la propiedad ubicada en <strong>${propertyData.address}</strong> a través de S.A.R.A.</p>
                <h3 style="color: #2077c2;">Siguientes Pasos:</h3>
                <ol style="padding-left: 20px;">
                  <li><strong>Regístrate o Inicia Sesión</strong>: Si aún no tienes una cuenta, regístrate en S.A.R.A. Si ya tienes una, simplemente inicia sesión.</li>
                  <li><strong>Revisa el Contrato</strong>: En tu panel principal (Dashboard), encontrarás el nuevo contrato pendiente de aprobación.</li>
                  <li><strong>Aprueba el Contrato</strong>: Lee detenidamente los términos y, si estás de acuerdo, aprueba el contrato para activarlo.</li>
                </ol>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://www.sarachile.com/login" style="background-color: #2077c2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a S.A.R.A</a>
                </div>
                <p style="font-size: 0.9em; color: #777;">Si tienes alguna pregunta, por favor contacta directamente a ${currentUser.name}.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
                <p style="font-size: 0.8em; color: #aaa; text-align: center;">Enviado a través de S.A.R.A - Sistema de Administración Responsable de Arriendos</p>
              </div>
            </div>
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

  const handleUpdateStatus = async (contract: Contract, status: Contract['status']) => {
    try {
      const contractRef = doc(db, 'contracts', contract.id);
      await updateDoc(contractRef, { status });
      toast({
        title: `Contrato ${status === 'Activo' ? 'Aprobado' : 'Rechazado'}`,
        description: `El estado del contrato ha sido actualizado.`,
      });
      fetchContractsAndProperties();
    } catch (error) {
      console.error("Error updating contract status:", error);
      toast({
        title: 'Error al actualizar',
        description: 'No se pudo cambiar el estado del contrato.',
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

  const columns = createColumns({ onEdit: handleEdit, onDelete: openDeleteDialog, userRole: currentUser!.role });

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
                    userRole={currentUser!.role}
                    onEdit={() => handleEdit(contract)} 
                    onDelete={() => openDeleteDialog(contract)}
                    onUpdateStatus={(status) => handleUpdateStatus(contract, status)}
                  />
              ))}
          </div>
       ) : (
          <ContractsDataTable 
            columns={columns} 
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
