
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Contract, Property } from '@/types';
import { ContractDisplay } from '@/components/legal/ContractDisplay';
import { IncidentHistory } from '@/components/legal/IncidentHistory';
import { PriorNotice } from '@/components/legal/PriorNotice';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileWarning, Download, Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function LegalRecoveryClient() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'Arrendador') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const contractsQuery = query(collection(db, 'contracts'), where('landlordId', '==', currentUser.uid));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setContracts(contractsList);

      const propertyIds = [...new Set(contractsList.map(c => c.propertyId))];
      if (propertyIds.length > 0) {
          const propertiesQuery = query(collection(db, 'properties'), where('__name__', 'in', propertyIds));
          const propertiesSnapshot = await getDocs(propertiesQuery);
          const propertiesList = propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Property));
          setProperties(propertiesList);
      }
      
      if (contractsList.length > 0 && !selectedContractId) {
        setSelectedContractId(contractsList[0].id);
      }

    } catch (error) {
      console.error("Error fetching legal recovery data:", error);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron obtener los contratos y propiedades.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast, selectedContractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeContracts = useMemo(() => {
    return contracts.filter(c => c.status === 'Activo');
  }, [contracts]);

  const selectedContract = useMemo(() => {
    return contracts.find(c => c.id === selectedContractId) || null;
  }, [selectedContractId, contracts]);

  const selectedProperty = useMemo(() => {
    if (!selectedContract) return null;
    return properties.find(p => p.id === selectedContract.propertyId) || null;
  }, [selectedContract, properties]);
  
  const handleSendToLawyer = () => {
    setIsSendDialogOpen(false);
    toast({
      title: 'Documentación Enviada',
      description: 'Los documentos del caso han sido enviados al abogado en convenio (simulación).',
    });
  };

  if (loading) {
      return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (currentUser?.role !== 'Arrendador') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acceso Denegado</AlertTitle>
        <AlertDescription>Esta sección solo está disponible para arrendadores.</AlertDescription>
      </Alert>
    );
  }

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
              <Button variant="outline" onClick={() => window.print()} disabled={!selectedContract}>
                <Download className="mr-2 h-4 w-4" />
                Descargar Documentación
              </Button>
              <Button onClick={() => setIsSendDialogOpen(true)} disabled={!selectedContract}>
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
            <TabsContent value="incident_history" className="print:block print:mt-8">
              <IncidentHistory contract={selectedContract} />
            </TabsContent>
            <TabsContent value="contract_display" className="print:block print:mt-8">
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
