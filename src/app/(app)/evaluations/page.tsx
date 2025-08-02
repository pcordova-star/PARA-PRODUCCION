'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import type { Evaluation, Contract, UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import { EvaluationCard } from '@/components/evaluations/evaluation-card';
import { EvaluationFormDialog } from '@/components/evaluations/evaluation-form-dialog';
import { TenantEvaluationConfirmationDialog } from '@/components/evaluations/tenant-evaluation-confirmation-dialog';
import { EvaluationsDataTable } from '@/components/evaluations/evaluations-data-table';
import { columns as createColumns } from '@/components/evaluations/evaluations-columns';


// --- MOCK DATA ---
const mockUserLandlord: UserProfile = { uid: 'user_landlord_123', role: 'Arrendador', name: 'Carlos Arrendador', email: 'carlos@sara.com' };
const mockUserTenant: UserProfile = { uid: 'user_tenant_456', role: 'Arrendatario', name: 'Juan Pérez', email: 'juan@sara.com' };

const mockContracts: Contract[] = [
  {
    id: 'CTR-001',
    propertyId: '1',
    propertyAddress: 'Av. Providencia 123',
    propertyName: 'Depto. en Providencia',
    landlordId: mockUserLandlord.uid,
    landlordName: 'Carlos Arrendador',
    tenantId: mockUserTenant.uid,
    tenantName: 'Juan Pérez',
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2024-01-14T00:00:00Z',
    rentAmount: 500000,
    status: 'Finalizado',
    propertyUsage: 'Habitacional',
    tenantEmail: 'juan.perez@email.com',
    tenantRut: '11.111.111-1',
  },
  {
    id: 'CTR-002',
    propertyId: '2',
    propertyAddress: 'Calle Falsa 123',
    propertyName: 'Casa en Las Condes',
    landlordId: mockUserLandlord.uid,
    landlordName: 'Carlos Arrendador',
    tenantId: 'user_tenant_789',
    tenantName: 'Ana García',
    startDate: '2022-03-01T00:00:00Z',
    endDate: '2023-02-28T00:00:00Z',
    rentAmount: 1200000,
    status: 'Finalizado',
    propertyUsage: 'Habitacional',
    tenantEmail: 'ana.garcia@email.com',
    tenantRut: '22.222.222-2',
  },
];

const initialEvaluations: Evaluation[] = [
  {
    id: 'EVAL-001',
    contractId: 'CTR-001',
    propertyId: '1',
    propertyName: 'Depto. en Providencia',
    landlordId: mockUserLandlord.uid,
    landlordName: 'Carlos Arrendador',
    tenantId: mockUserTenant.uid,
    tenantName: 'Juan Pérez',
    evaluationDate: '2024-01-20T00:00:00Z',
    status: 'recibida',
    criteria: {
      paymentPunctuality: 5,
      propertyCare: 4,
      communication: 5,
      generalBehavior: 5,
    },
    tenantComment: 'Gracias por la evaluación. Fue un gusto ser su arrendatario.',
    tenantConfirmedAt: '2024-01-21T00:00:00Z',
  },
   {
    id: 'EVAL-002',
    contractId: 'CTR-002',
    propertyId: '2',
    propertyName: 'Casa en Las Condes',
    landlordId: mockUserLandlord.uid,
    landlordName: 'Carlos Arrendador',
    tenantId: 'user_tenant_789',
    tenantName: 'Ana García',
    evaluationDate: '2023-03-05T00:00:00Z',
    status: 'pendiente de confirmacion',
    criteria: {
      paymentPunctuality: 4,
      propertyCare: 3,
      communication: 4,
      generalBehavior: 4,
    },
  },
];


export default function EvaluationsPage() {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluations);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [evaluationToConfirm, setEvaluationToConfirm] = useState<Evaluation | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // MOCK: Simulating current user.
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUserLandlord);
  const isLandlordView = currentUser.role === 'Arrendador';

  const handleSaveEvaluation = async (data: any) => {
    setProcessingId('new-evaluation');
    const contract = mockContracts.find(c => c.id === data.contractId);
    if (!contract) {
        toast({ title: 'Error', description: 'Contrato no encontrado', variant: 'destructive' });
        setProcessingId(null);
        return;
    };

    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));

    const newEvaluation: Evaluation = {
        id: uuidv4(),
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

    setEvaluations(prev => [newEvaluation, ...prev]);
    toast({ title: 'Evaluación Creada', description: 'El arrendatario será notificado para confirmar la recepción.' });
    setIsFormOpen(false);
    setProcessingId(null);
  };
  
  const handleConfirmReception = async (evaluationId: string, { tenantComment }: { tenantComment?: string }) => {
    setProcessingId(evaluationId);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));

    setEvaluations(prev =>
      prev.map(ev =>
        ev.id === evaluationId
          ? { ...ev, status: 'recibida', tenantComment: tenantComment || undefined, tenantConfirmedAt: new Date().toISOString() }
          : ev
      )
    );
    toast({ title: 'Recepción Confirmada', description: 'La evaluación ha sido marcada como recibida.' });
    setIsConfirmationOpen(false);
    setEvaluationToConfirm(null);
    setProcessingId(null);
  };
  
  const openConfirmationDialog = (evaluation: Evaluation) => {
    setEvaluationToConfirm(evaluation);
    setIsConfirmationOpen(true);
  };

  const filteredEvaluations = useMemo(() => {
    if (isLandlordView) {
      return evaluations.filter(ev => ev.landlordId === currentUser.uid);
    }
    return evaluations.filter(ev => ev.tenantId === currentUser.uid);
  }, [evaluations, currentUser, isLandlordView]);

  const finishedContractsForLandlord = useMemo(() => {
    return mockContracts.filter(c => c.landlordId === currentUser.uid && c.status === 'Finalizado');
  }, [currentUser]);

  const columns = createColumns({ userRole: currentUser.role, onConfirm: openConfirmationDialog });

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evaluaciones de Arrendatarios</h1>
          <p className="text-muted-foreground">
            {isLandlordView 
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
            <Button onClick={() => setCurrentUser(isLandlordView ? mockUserTenant : mockUserLandlord)}>
              Cambiar a Vista {isLandlordView ? 'Arrendatario' : 'Arrendador'}
            </Button>
            {isLandlordView && (
              <Button onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Evaluar Arrendatario
              </Button>
            )}
        </div>
      </div>

       {filteredEvaluations.length > 0 ? (
         viewMode === 'cards' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvaluations.map(ev => (
                <EvaluationCard 
                  key={ev.id}
                  evaluation={ev}
                  userRole={currentUser.role}
                  onConfirmReception={openConfirmationDialog}
                  isProcessing={processingId === ev.id}
                />
              ))}
            </div>
         ) : (
            <EvaluationsDataTable columns={columns} data={filteredEvaluations} />
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
