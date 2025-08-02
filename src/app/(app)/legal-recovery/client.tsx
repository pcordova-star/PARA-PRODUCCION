"use client";

import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Contract, Property, Incident } from '@/types';
import { ContractDisplay } from '@/components/legal/ContractDisplay';
import { IncidentHistory } from '@/components/legal/IncidentHistory';
import { PriorNotice } from '@/components/legal/PriorNotice';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileWarning, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// --- MOCK DATA ---
const mockContracts: Contract[] = [
  {
    id: 'CTR-001',
    propertyId: '1',
    propertyAddress: 'Av. Providencia 123',
    propertyName: 'Depto. en Providencia',
    landlordId: 'user_landlord_123',
    landlordName: 'Carlos Arrendador',
    tenantId: 'user_tenant_456',
    tenantName: 'Juan Pérez',
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2024-12-31T00:00:00Z',
    rentAmount: 500000,
    status: 'Activo',
    propertyUsage: 'Habitacional',
    tenantEmail: 'juan.perez@email.com',
    tenantRut: '11.111.111-1',
    securityDepositAmount: 500000,
    rentPaymentDay: 5,
    specialClauses: "Se permite una mascota pequeña (perro o gato) en la propiedad, con la condición de que el arrendatario se hará cargo de cualquier daño que esta pueda causar."
  },
   {
    id: 'CTR-003',
    propertyId: '3',
    propertyName: 'Oficina Central, Apoquindo 5000',
    landlordName: 'Laura Propietaria',
    propertyAddress: 'Apoquindo 5000',
    tenantName: 'Startup Innovadora SpA',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2025-12-31T00:00:00Z',
    rentAmount: 800000,
    status: 'Activo',
    propertyUsage: 'Comercial',
    tenantEmail: 'contacto@startup.com',
    tenantRut: '76.123.456-7',
    securityDepositAmount: 1600000,
    rentPaymentDay: 1,
  },
];

const mockProperties: Property[] = [
  {
    id: '1',
    code: 'PRO-001',
    address: 'Av. Providencia 123',
    comuna: 'Providencia',
    region: 'Metropolitana de Santiago',
    status: 'Arrendada',
    price: 500000,
    type: 'Departamento',
    ownerRut: '12.345.678-9',
    area: 50,
    bedrooms: 2,
    bathrooms: 1,
    description: 'Acogedor departamento en el corazón de Providencia.'
  },
   {
    id: '3',
    code: 'PRO-003',
    address: 'Apoquindo 5000',
    comuna: 'Las Condes',
    region: 'Metropolitana de Santiago',
    status: 'Arrendada',
    price: 800000,
    type: 'Local Comercial',
    ownerRut: '11.222.333-4',
    area: 80,
    bedrooms: 0,
    bathrooms: 1,
    description: 'Oficina moderna en polo de negocios.'
  },
];

export default function LegalRecoveryClient() {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const { toast } = useToast();

  const activeContracts = useMemo(() => {
    // MOCK: Assuming landlord view. Filter for active contracts.
    return mockContracts.filter(c => c.status === 'Activo');
  }, []);

  const selectedContract = useMemo(() => {
    return mockContracts.find(c => c.id === selectedContractId) || null;
  }, [selectedContractId]);

  const selectedProperty = useMemo(() => {
    if (!selectedContract) return null;
    return mockProperties.find(p => p.id === selectedContract.propertyId) || null;
  }, [selectedContract]);
  
  // Set default selected contract on initial render
  React.useEffect(() => {
    if (activeContracts.length > 0 && !selectedContractId) {
      setSelectedContractId(activeContracts[0].id);
    }
  }, [activeContracts, selectedContractId]);

  const handleSendToLawyer = () => {
    // Simulate sending action
    setIsSendDialogOpen(false);
    toast({
      title: 'Documentación Enviada',
      description: 'Los documentos del caso han sido enviados al abogado en convenio (simulación).',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg print:hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Herramientas de Recuperación Legal</CardTitle>
          <CardDescription>
            Genere y gestione documentos clave para incumplimientos contractuales. 
            Seleccione un contrato activo para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-sm font-medium mb-2 block">Contrato Activo</label>
              <Select
                value={selectedContractId || ""}
                onValueChange={setSelectedContractId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un contrato activo..." />
                </SelectTrigger>
                <SelectContent>
                  {activeContracts.map(contract => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.propertyName} (Arrendatario: {contract.tenantName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-self-end self-end">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Descargar Documentación
              </Button>
              <Button onClick={() => setIsSendDialogOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Enviar a Abogado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedContract && selectedProperty ? (
        <div className="printable-area">
          <Tabs defaultValue="prior_notice" className="w-full">
            <TabsList className="grid w-full grid-cols-3 print:hidden">
              <TabsTrigger value="prior_notice">Notificación Previa</TabsTrigger>
              <TabsTrigger value="incident_history">Historial de Incidentes</TabsTrigger>
              <TabsTrigger value="contract_display">Visualizar Contrato</TabsTrigger>
            </TabsList>
            <div className="print:block hidden text-center my-4">
              <h2 className="text-2xl font-bold">Documentación Legal - Contrato {selectedContract.id}</h2>
              <p>Generado el {new Date().toLocaleDateString('es-CL')}</p>
            </div>
            <TabsContent value="prior_notice" className="print:block">
               <PriorNotice contract={selectedContract} />
            </TabsContent>
            <TabsContent value="incident_history" className="print:block hidden print:mt-8">
              <IncidentHistory contract={selectedContract} />
            </TabsContent>
            <TabsContent value="contract_display" className="print:block hidden print:mt-8">
              <ContractDisplay contract={selectedContract} property={selectedProperty} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
         <Alert variant="default" className="mt-6 border-dashed print:hidden">
            <FileWarning className="h-4 w-4" />
            <AlertTitle>Seleccione un Contrato</AlertTitle>
            <AlertDescription>
                Por favor, elija un contrato de la lista superior para generar y visualizar los documentos legales asociados.
            </AlertDescription>
        </Alert>
      )}

      <AlertDialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar envío a abogado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción enviará una copia del contrato, el historial de incidentes y el borrador de la notificación previa al abogado en convenio de S.A.R.A. Esta acción es simulada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendToLawyer}>Sí, enviar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:mt-8 { margin-top: 2rem !important; }
          .printable-area .print\\:block {
             page-break-before: always;
          }
           .printable-area > div > div:first-child {
            page-break-before: auto;
          }
        }
      `}</style>
    </div>
  );
}
