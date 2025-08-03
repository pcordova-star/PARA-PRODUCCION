'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import type { Evaluation, Contract, UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { EvaluationCard } from '@/components/evaluations/evaluation-card';
import { EvaluationFormDialog } from '@/components/evaluations/evaluation-form-dialog';
import { TenantEvaluationConfirmationDialog } from '@/components/evaluations/tenant-evaluation-confirmation-dialog';
import { EvaluationsDataTable } from '@/components/evaluations/evaluations-data-table';
import { columns as createColumns } from '@/components/evaluations/evaluations-columns';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { sendEmail } from '@/lib/notifications';


export default function EvaluationsPage() {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [evaluationToConfirm, setEvaluationToConfirm] = useState<Evaluation | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const { currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const contractsQuery = query(
        collection(db, 'contracts'),
        where(currentUser.role === 'Arrendador' ? 'landlordId' : 'tenantId', '==', currentUser.uid)
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setContracts(contractsList);
      
      const contractIds = contractsList.map(c => c.id);
      if (contractIds.length > 0) {
        const evaluationsQuery = query(collection(db, 'evaluations'), where('contractId', 'in', contractIds));
        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        const evaluationsList = evaluationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Evaluation));
        setEvaluations(evaluationsList);
      } else {
        setEvaluations([]);
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


  const handleSaveEvaluation = async (data: any) => {
    if (!currentUser || currentUser.role !== 'Arrendador') return;
    setProcessingId('new-evaluation');
    const contract = contracts.find(c => c.id === data.contractId);
    if (!contract) {
        toast({ title: 'Error', description: 'Contrato no encontrado', variant: 'destructive' });
        setProcessingId(null);
        return;
    };

    try {
        const newEvaluationData: Omit<Evaluation, 'id'> = {
            ...data,
            propertyId: contract.propertyId,
            propertyName: contract.propertyName,
            landlordId: contract.landlordId,
            landlordName: contract.landlordName,
            tenantId: contract.tenantId,
            tenantName: contract.tenantName,
            evaluationDate: new Date().toISOString(),
            status: 'pendiente de confirmacion',
        };
        await addDoc(collection(db, 'evaluations'), newEvaluationData);
        
        const tenantDoc = await getDoc(doc(db, 'users', contract.tenantId!));
        const tenantEmail = tenantDoc.exists() ? tenantDoc.data().email : null;
        
        if (tenantEmail) {
            await sendEmail({
                to: tenantEmail,
                subject: `Has recibido una evaluación de ${currentUser.name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                            <h1 style="color: #2077c2; text-align: center;">¡Has sido evaluado!</h1>
                            <p>Hola ${contract.tenantName},</p>
                            <p><strong>${currentUser.name}</strong> ha completado tu evaluación para el arriendo de la propiedad <strong>${contract.propertyName}</strong>.</p>
                            <p>Para mantener la transparencia y asegurar que estás de acuerdo con la evaluación, te pedimos que la revises y confirmes su recepción en la plataforma.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://www.sarachile.com/login" style="background-color: #2077c2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a S.A.R.A</a>
                            </div>
                        </div>
                    </div>
                `,
            });
        }
        
        toast({ title: 'Evaluación Creada', description: 'El arrendatario ha sido notificado para confirmar la recepción.' });
        fetchData();
        setIsFormOpen(false);
    } catch (error) {
        console.error("Error saving evaluation:", error);
        toast({ title: 'Error', description: 'No se pudo guardar la evaluación.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };
  
  const handleConfirmReception = async (evaluationId: string, { tenantComment }: { tenantComment?: string }) => {
    setProcessingId(evaluationId);
    try {
        const evaluationRef = doc(db, 'evaluations', evaluationId);
        await updateDoc(evaluationRef, {
            status: 'recibida',
            tenantComment: tenantComment || null,
            tenantConfirmedAt: new Date().toISOString()
        });
        toast({ title: 'Recepción Confirmada', description: 'La evaluación ha sido marcada como recibida.' });
        fetchData();
        setIsConfirmationOpen(false);
        setEvaluationToConfirm(null);
    } catch(error) {
        console.error("Error confirming evaluation:", error);
        toast({ title: 'Error', description: 'No se pudo confirmar la evaluación.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };
  
  const openConfirmationDialog = (evaluation: Evaluation) => {
    setEvaluationToConfirm(evaluation);
    setIsConfirmationOpen(true);
  };

  const finishedContractsForLandlord = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Arrendador') return [];
    return contracts.filter(c => c.status === 'Finalizado');
  }, [contracts, currentUser]);

  const columns = createColumns({ userRole: currentUser!.role, onConfirm: openConfirmationDialog });

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
          <h1 className="text-3xl font-bold tracking-tight">Evaluaciones de Arrendatarios</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === 'Arrendador' 
              ? 'Evalúe a sus arrendatarios al finalizar un contrato.'
              : 'Revise las evaluaciones recibidas de sus arrendadores.'
            }
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
            {currentUser?.role === 'Arrendador' && (
              <Button onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Evaluar Arrendatario
              </Button>
            )}
        </div>
      </div>

       {evaluations.length > 0 ? (
         viewMode === 'cards' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {evaluations.map(ev => (
                <EvaluationCard 
                  key={ev.id}
                  evaluation={ev}
                  userRole={currentUser!.role}
                  onConfirmReception={openConfirmationDialog}
                  isProcessing={processingId === ev.id}
                />
              ))}
            </div>
         ) : (
            <EvaluationsDataTable columns={columns} data={evaluations} />
         )
       ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No hay evaluaciones</h3>
            <p className="text-muted-foreground mt-1">
                Aún no se han generado o recibido evaluaciones.
            </p>
        </div>
      )}

      <EvaluationFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveEvaluation}
        landlordContracts={finishedContractsForLandlord}
      />
      
      <TenantEvaluationConfirmationDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        evaluation={evaluationToConfirm}
        onConfirm={handleConfirmReception}
      />
    </div>
  );
}
