
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import { IncidentCard } from '@/components/incidents/incident-card';
import { IncidentFormDialog } from '@/components/incidents/incident-form-dialog';
import { IncidentResponseDialog } from '@/components/incidents/incident-response-dialog';
import type { Incident, Contract, UserRole, UserProfile, IncidentResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { IncidentsDataTable } from '@/components/incidents/incidents-data-table';
import { columns as createColumns } from '@/components/incidents/incidents-columns';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { sendEmail } from '@/lib/notifications';


export default function IncidentsPage() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [incidentToRespond, setIncidentToRespond] = useState<Incident | null>(null);
  const [incidentToCloseId, setIncidentToCloseId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const { currentUser } = useAuth();


  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userField = currentUser.role === 'Arrendador' ? 'landlordId' : 'tenantId';
      const contractsQuery = query(
        collection(db, 'contracts'), 
        where(userField, '==', currentUser.uid),
        where('managementType', '==', 'collaborative') // Only collaborative contracts
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setContracts(contractsList);
      
      const contractIds = contractsList.map(c => c.id);
      if (contractIds.length > 0) {
        const incidentsQuery = query(collection(db, 'incidents'), where('contractId', 'in', contractIds));
        const incidentsSnapshot = await getDocs(incidentsQuery);
        const incidentsList = incidentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident));
        setIncidents(incidentsList);
      } else {
        setIncidents([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleSaveIncident = async (data: any, contract: Contract) => {
    if (!currentUser) return;
    setProcessingId('new-incident');
    
    try {
        let initialAttachmentUrl: string | null = null;
        let initialAttachmentName: string | null = null;

        if (data.initialAttachment && data.initialAttachment.length > 0) {
            const file = data.initialAttachment[0];
            initialAttachmentName = file.name;
            const storageRef = ref(storage, `incident-attachments/${currentUser.uid}/${Date.now()}-${file.name}`);
            toast({ title: "Subiendo archivo...", description: "Por favor espera." });
            const snapshot = await uploadBytes(storageRef, file);
            initialAttachmentUrl = await getDownloadURL(snapshot.ref);
            toast({ title: "Archivo subido", description: "El adjunto se ha subido correctamente." });
        }
        
        // Remove FileList from data before saving to Firestore
        const { initialAttachment, ...restOfData } = data;

        const newIncidentData: Omit<Incident, 'id'> = {
          ...restOfData,
          initialAttachmentUrl,
          initialAttachmentName,
          propertyId: contract.propertyId,
          propertyName: contract.propertyName,
          landlordId: contract.landlordId,
          landlordName: contract.landlordName,
          tenantId: contract.tenantId,
          tenantName: contract.tenantName,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.uid,
          status: 'pendiente',
          responses: [],
        };
        await addDoc(collection(db, 'incidents'), newIncidentData);

        if (contract.managementType === 'collaborative') {
            const isCreatorLandlord = currentUser.role === 'Arrendador';
            const recipientId = isCreatorLandlord ? contract.tenantId : contract.landlordId;
            
            if (!recipientId) {
                console.warn("Recipient ID is missing, cannot send notification.");
                toast({ title: 'Incidente Reportado', description: 'El incidente fue creado, pero no se pudo notificar a la otra parte (ID no encontrado).' });
            } else {
                const recipientDoc = await getDoc(doc(db, 'users', recipientId));
                const recipientEmail = recipientDoc.exists() ? recipientDoc.data().email : null;
                const recipientName = isCreatorLandlord ? contract.tenantName : contract.landlordName;

                if (recipientEmail) {
                    await sendEmail({
                        to: recipientEmail,
                        subject: `Nuevo Incidente Reportado en ${contract.propertyName}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                                    <h1 style="color: #d9534f; text-align: center;">Nuevo Incidente Reportado</h1>
                                    <p>Hola ${recipientName},</p>
                                    <p><strong>${currentUser.name}</strong> ha reportado un nuevo incidente para la propiedad <strong>${contract.propertyName}</strong>.</p>
                                    <ul>
                                        <li><strong>Tipo:</strong> ${data.type}</li>
                                        <li><strong>Descripción:</strong> ${data.description}</li>
                                    </ul>
                                    <p>Por favor, inicia sesión en S.A.R.A para revisar y responder a este incidente.</p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="http://www.sarachile.com/login" style="background-color: #2077c2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a S.A.R.A</a>
                                    </div>
                                </div>
                            </div>
                        `,
                    });
                     toast({ title: 'Incidente Reportado', description: 'La otra parte ha sido notificada.' });
                }
            }
        } else {
             toast({ title: 'Incidente Reportado', description: 'El incidente ha sido registrado para su gestión interna.' });
        }
        
        fetchData();
        setIsFormOpen(false);
    } catch(error) {
        console.error("Error saving incident:", error);
        toast({ title: 'Error', description: 'No se pudo reportar el incidente.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };

  const handleSaveResponse = async (incidentId: string, data: any) => {
    if (!currentUser) return;
    setProcessingId(incidentId);
    
    try {
        const incidentRef = doc(db, 'incidents', incidentId);
        const incidentDoc = await getDoc(incidentRef);
        if (!incidentDoc.exists()) throw new Error("Incident not found");

        const existingResponses = incidentDoc.data().responses || [];
        const newResponse: IncidentResponse = {
            ...data,
            respondedAt: new Date().toISOString(),
            respondedBy: currentUser.uid,
        };

        await updateDoc(incidentRef, {
            status: 'respondido',
            responses: [...existingResponses, newResponse],
        });
        
        toast({ title: 'Respuesta Enviada', description: 'La respuesta ha sido registrada.' });
        fetchData();
        setIsResponseOpen(false);
        setIncidentToRespond(null);
    } catch (error) {
        console.error("Error saving response:", error);
        toast({ title: 'Error', description: 'No se pudo guardar la respuesta.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };
  
  const openResponseDialog = (incident: Incident) => {
    setIncidentToRespond(incident);
    setIsResponseOpen(true);
  };

  const openCloseDialog = (incidentId: string) => {
    setIncidentToCloseId(incidentId);
    setIsCloseDialogOpen(true);
  };

  const confirmCloseIncident = async () => {
    if (!incidentToCloseId || !currentUser) return;
    setProcessingId(incidentToCloseId);
    
    try {
        const incidentRef = doc(db, 'incidents', incidentToCloseId);
        await updateDoc(incidentRef, {
            status: 'cerrado',
            closedAt: new Date().toISOString(),
            closedBy: currentUser.uid,
        });
        toast({ title: 'Incidente Cerrado', description: 'El incidente ha sido marcado como resuelto.' });
        fetchData();
        setIsCloseDialogOpen(false);
        setIncidentToCloseId(null);
    } catch (error) {
         console.error("Error closing incident:", error);
        toast({ title: 'Error', description: 'No se pudo cerrar el incidente.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };


  const userContracts = useMemo(() => {
    if (!currentUser) return [];
    return contracts.filter(c => c.status === 'Activo');
  }, [contracts, currentUser]);

  const columns = createColumns({ onRespond: openResponseDialog, onClose: openCloseDialog, currentUser: currentUser! });
  
  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Incidentes</h1>
          <p className="text-muted-foreground">
            Reporte y de seguimiento a los incidentes de sus contratos colaborativos.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setViewMode('cards')} disabled={viewMode === 'cards'}>
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Vista de Tarjetas</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode('list')} disabled={viewMode === 'list'}>
              <List className="h-4 w-4" />
              <span className="sr-only">Vista de Lista</span>
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Reportar Incidente
            </Button>
        </div>
      </div>

       {incidents.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {incidents.map(incident => (
                    <IncidentCard 
                      key={incident.id} 
                      incident={incident} 
                      currentUser={currentUser}
                      onRespond={openResponseDialog}
                      onClose={openCloseDialog}
                      isProcessing={processingId === incident.id}
                    />
                ))}
            </div>
          ) : (
            <IncidentsDataTable columns={columns} data={incidents} />
          )
       ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No hay incidentes</h3>
            <p className="text-muted-foreground mt-1">
                Esta sección solo muestra incidentes de contratos colaborativos.
            </p>
        </div>
      )}

      <IncidentFormDialog 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveIncident}
        userContracts={userContracts}
        currentUserRole={currentUser?.role || null}
      />

      <IncidentResponseDialog
        open={isResponseOpen}
        onOpenChange={setIsResponseOpen}
        incident={incidentToRespond}
        onSave={handleSaveResponse}
        currentUserRole={currentUser?.role || null}
      />
      
      <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de cerrar este incidente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el incidente como resuelto. Podrá ser reabierto si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseIncident}>Sí, cerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
