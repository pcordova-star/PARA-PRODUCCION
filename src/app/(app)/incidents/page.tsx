'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { IncidentCard } from '@/components/incidents/incident-card';
import { IncidentFormDialog } from '@/components/incidents/incident-form-dialog';
import { IncidentResponseDialog } from '@/components/incidents/incident-response-dialog';
import type { Incident, Contract, UserRole, UserProfile, IncidentResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
    endDate: '2024-12-31T00:00:00Z',
    rentAmount: 500000,
    status: 'Activo',
    propertyUsage: 'Habitacional',
    tenantEmail: 'juan.perez@email.com',
    tenantRut: '11.111.111-1',
  },
];

const initialIncidents: Incident[] = [
  {
    id: 'INC-001',
    contractId: 'CTR-001',
    propertyId: '1',
    propertyName: 'Depto. en Providencia',
    landlordId: mockUserLandlord.uid,
    landlordName: 'Carlos Arrendador',
    tenantId: mockUserTenant.uid,
    tenantName: 'Juan Pérez',
    type: 'reparaciones necesarias',
    description: 'La llave del lavamanos del baño principal está goteando constantemente. Necesita ser reparada.',
    status: 'pendiente',
    createdAt: '2024-07-20T10:00:00Z',
    createdBy: mockUserTenant.uid,
  },
  {
    id: 'INC-002',
    contractId: 'CTR-001',
    propertyId: '1',
    propertyName: 'Depto. en Providencia',
    landlordId: mockUserLandlord.uid,
    landlordName: 'Carlos Arrendador',
    tenantId: mockUserTenant.uid,
    tenantName: 'Juan Pérez',
    type: 'pago',
    description: 'El pago de los gastos comunes de Junio no ha sido registrado.',
    status: 'respondido',
    createdAt: '2024-07-18T15:30:00Z',
    createdBy: mockUserLandlord.uid,
    responses: [
      {
        responseText: 'Hola Carlos, disculpa la demora. Ya realicé el pago, adjunto el comprobante. Saludos.',
        respondedAt: '2024-07-19T11:00:00Z',
        respondedBy: mockUserTenant.uid,
      },
    ],
  },
];

export default function IncidentsPage() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [incidentToRespond, setIncidentToRespond] = useState<Incident | null>(null);
  const [incidentToCloseId, setIncidentToCloseId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // MOCK: Simulating current user. In a real app, this would come from an auth context.
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUserLandlord);
  const isLandlordView = currentUser.role === 'Arrendador';

  const handleSaveIncident = async (data: any) => {
    setProcessingId('new-incident');
    const contract = mockContracts.find(c => c.id === data.contractId);
    if (!contract) return;
    
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    
    const newIncident: Incident = {
      id: uuidv4(),
      ...data,
      propertyId: contract.propertyId,
      propertyName: contract.propertyName,
      landlordId: contract.landlordId,
      landlordName: contract.landlordName,
      tenantId: contract.tenantId,
      tenantName: contract.tenantName,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.uid,
      status: 'pendiente',
    };

    setIncidents(prev => [newIncident, ...prev]);
    toast({ title: 'Incidente Reportado', description: 'La otra parte será notificada.' });
    setIsFormOpen(false);
    setProcessingId(null);
  };

  const handleSaveResponse = async (incidentId: string, data: IncidentResponse) => {
    setProcessingId(incidentId);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          const newResponse: IncidentResponse = {
            ...data,
            respondedAt: new Date().toISOString(),
            respondedBy: currentUser.uid,
          };
          return {
            ...inc,
            status: 'respondido',
            responses: [...(inc.responses || []), newResponse],
          };
        }
        return inc;
      })
    );
    toast({ title: 'Respuesta Enviada', description: 'La respuesta ha sido registrada.' });
    setIsResponseOpen(false);
    setIncidentToRespond(null);
    setProcessingId(null);
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
    if (!incidentToCloseId) return;
    setProcessingId(incidentToCloseId);
    
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));

    setIncidents(prev =>
      prev.map(inc =>
        inc.id === incidentToCloseId
          ? { ...inc, status: 'cerrado', closedAt: new Date().toISOString(), closedBy: currentUser.uid }
          : inc
      )
    );
    toast({ title: 'Incidente Cerrado', description: 'El incidente ha sido marcado como resuelto.' });
    setIsCloseDialogOpen(false);
    setIncidentToCloseId(null);
    setProcessingId(null);
  };

  const filteredIncidents = useMemo(() => {
    if (isLandlordView) {
        return incidents;
    }
    return incidents.filter(inc => inc.tenantId === currentUser.uid);
  }, [incidents, currentUser, isLandlordView]);

  const userContracts = useMemo(() => {
    if (isLandlordView) return mockContracts.filter(c => c.landlordId === currentUser.uid);
    return mockContracts.filter(c => c.tenantId === currentUser.uid);
  }, [currentUser, isLandlordView]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Incidentes</h1>
          <p className="text-muted-foreground">
            Reporte y de seguimiento a los incidentes de sus propiedades.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
            <Button onClick={() => setCurrentUser(isLandlordView ? mockUserTenant : mockUserLandlord)}>
              Cambiar a Vista {isLandlordView ? 'Arrendatario' : 'Arrendador'}
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Reportar Incidente
            </Button>
        </div>
      </div>

       {filteredIncidents.length > 0 ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredIncidents.map(incident => (
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
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No hay incidentes</h3>
            <p className="text-muted-foreground mt-1">
                Aún no se han reportado incidentes para sus contratos.
            </p>
        </div>
      )}

      <IncidentFormDialog 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveIncident}
        userContracts={userContracts}
        currentUserRole={currentUser.role}
      />

      <IncidentResponseDialog
        open={isResponseOpen}
        onOpenChange={setIsResponseOpen}
        incident={incidentToRespond}
        onSave={handleSaveResponse}
        currentUserRole={currentUser.role}
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
