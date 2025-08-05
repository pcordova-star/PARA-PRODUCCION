
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
import { collection, getDocs, doc, updateDoc, query, where, getDoc, writeBatch, arrayUnion, addDoc, setDoc, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { sendCreationEmailToTenant } from '@/lib/notifications';
import { ContractDetailsDialog } from '@/components/contracts/contract-details-dialog';
import { v4 as uuidv4 } from 'uuid';
import { signContractAction } from '@/app/sign/[token]/actions';


export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
      let contractsQuery;
      
      if (currentUser.role === 'Arrendador') {
        console.log(`[DEBUG] Buscando contratos de Arrendador con UID: ${currentUser.uid}`);
        contractsQuery = query(
            collection(db, 'contracts'), 
            where('landlordId', '==', currentUser.uid), 
            where('status', '!=', 'Archivado')
        );
      } else { // Arrendatario
        console.log(`[DEBUG] Buscando contratos de Arrendatario con UID: ${currentUser.uid}`);
        contractsQuery = query(
            collection(db, 'contracts'), 
            where('tenantId', '==', currentUser.uid), 
            where('status', '!=', 'Archivado')
        );
      }

      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      console.log("[DEBUG] Contratos encontrados:", contractsList.length, contractsList.map(c => ({ id: c.id, status: c.status, tenantId: c.tenantId })));
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
      const propertyData = propertySnap.data() as Property;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", values.tenantEmail));
      const querySnapshot = await getDocs(q);
      
      let tenantId: string | null = null;
      let tenantData: UserProfile | null = null;

      if (!querySnapshot.empty) {
          const tenantDoc = querySnapshot.docs[0];
          tenantId = tenantDoc.id;
          tenantData = tenantDoc.data() as UserProfile;
      }
      
      const signatureToken = selectedContract?.signatureToken || uuidv4();
      
      const newContractRef = doc(collection(db, "contracts"));

      const contractDataPayload = {
          ...values,
          id: newContractRef.id,
          startDate: values.startDate instanceof Date ? values.startDate.toISOString() : values.startDate,
          endDate: values.endDate instanceof Date ? values.endDate.toISOString() : values.endDate,
          landlordId: currentUser.uid,
          landlordName: currentUser.name,
          tenantId: tenantId,
          tenantName: tenantData?.name || values.tenantName,
          tenantRut: values.tenantRut,
          propertyAddress: propertyData.address,
          propertyName: `${propertyData.type} en ${propertyData.comuna}`,
          status: 'Borrador' as const,
          signatureToken: signatureToken,
          signedByTenant: false,
          signedByLandlord: false,
      };
      
      await setDoc(newContractRef, contractDataPayload);

      if (selectedContract) {
        // This logic path is less likely now, but kept for robustness if editing is re-enabled for new contracts
        const contractRef = doc(db, 'contracts', selectedContract.id);
        await updateDoc(contractRef, contractDataPayload);
        toast({ title: 'Contrato actualizado', description: 'Los cambios se han guardado.' });
      } else {
        if (!tenantId) {
            const normalizedEmail = values.tenantEmail.toLowerCase();
            const tempUserRef = doc(db, 'tempUsers', normalizedEmail);
            const tempUserSnap = await getDoc(tempUserRef);
            
            if (tempUserSnap.exists()) {
                 await updateDoc(tempUserRef, {
                    pendingContracts: arrayUnion(newContractRef.id)
                });
            } else {
                await setDoc(tempUserRef, {
                    pendingContracts: [newContractRef.id]
                });
            }
        }
        
        toast({ title: 'Contrato creado', description: 'Se ha enviado una notificación al arrendatario.' });
      }

      await sendCreationEmailToTenant({
        tenantEmail: values.tenantEmail,
        tenantName: values.tenantName,
        landlordName: currentUser.name,
        propertyAddress: propertyData.address,
        appUrl: window.location.origin,
        signatureToken: signatureToken
      });

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

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsOpen(true);
  };
  
  const handleResendNotification = async (contract: Contract) => {
    if (!currentUser || currentUser.role !== 'Arrendador' || !contract.signatureToken) return;

    setIsSubmitting(true);
    try {
        await sendCreationEmailToTenant({
            tenantEmail: contract.tenantEmail,
            tenantName: contract.tenantName,
            landlordName: currentUser.name,
            propertyAddress: contract.propertyAddress,
            appUrl: window.location.origin,
            signatureToken: contract.signatureToken,
        });
        toast({ title: 'Notificación Reenviada', description: 'Se ha enviado un nuevo correo al arrendatario.' });
    } catch (error) {
        console.error("Error resending notification:", error);
        toast({ title: 'Error', description: 'No se pudo reenviar la notificación.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!contractToDelete) return;
    try {
        const contractRef = doc(db, 'contracts', contractToDelete.id);
        await updateDoc(contractRef, {
            status: 'Archivado',
            archivedAt: new Date().toISOString(),
        });
        toast({ 
            title: 'Contrato Archivado', 
            description: `El contrato con ${contractToDelete.tenantName} ha sido archivado y se eliminará en 15 días.`,
            variant: 'default' 
        });
        fetchContractsAndProperties();
        setIsDeleteDialogOpen(false);
        setContractToDelete(null);
    } catch (error) {
        console.error("Error archiving contract:", error);
        toast({
            title: 'Error al archivar',
            description: 'No se pudo archivar el contrato.',
            variant: 'destructive',
        });
    }
  };

  const handleSignContract = async (contract: Contract) => {
    if (!currentUser || currentUser.uid !== contract.landlordId) return;

    setIsSubmitting(true);
    const result = await signContractAction({ contractId: contract.id });
    setIsSubmitting(false);

    if (result.error) {
      toast({ title: "Error al firmar", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Firma registrada", description: "El contrato ha sido firmado exitosamente." });
      fetchContractsAndProperties();
    }
  };
  
  const handleExport = () => {
    const dataToExport = contracts.map(c => ({
      ID: c.id,
      Propiedad_Direccion: c.propertyAddress,
      Arrendatario: c.tenantName,
      RUT_Arrendatario: c.tenantRut,
      Email_Arrendatario: c.tenantEmail,
      Fecha_Inicio: c.startDate ? new Date(c.startDate).toLocaleDateString('es-CL') : '',
      Fecha_Fin: c.endDate ? new Date(c.endDate).toLocaleDateString('es-CL') : '',
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

  const columns = createColumns({ onEdit: handleEdit, onDelete: openDeleteDialog, userRole: currentUser!.role, onSign: handleSignContract, onViewDetails: handleViewDetails });

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
                    onSign={() => handleSignContract(contract)}
                    onViewDetails={() => handleViewDetails(contract)}
                    onResend={() => handleResendNotification(contract)}
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
      
      <ContractDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        contract={selectedContract}
      />


      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea archivar este contrato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción archivará el contrato. El arrendatario aún podrá verlo por un período de 15 días antes de que sea eliminado permanentemente de la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
