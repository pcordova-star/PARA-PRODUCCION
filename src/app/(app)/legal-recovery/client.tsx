
"use client";

import React, from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Contract, Property } from '@/types';
import { ContractDisplay } from '@/components/legal/ContractDisplay';
import { LegalDossier } from '@/components/legal/LegalDossier';
import { PriorNotice } from '@/components/legal/PriorNotice';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileWarning, Download, Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useMemo, useEffect, useCallback } from 'react';
import html2pdf from 'html2pdf.js';

export default function LegalRecoveryClient() {
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
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
      // Fetch only active, collaborative contracts
      const contractsQuery = query(
        collection(db, 'contracts'), 
        where('landlordId', '==', currentUser.uid),
        where('status', '==', 'Activo'),
        where('managementType', '==', 'collaborative')
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setActiveContracts(contractsList);

      const propertyIds = [...new Set(contractsList.map(c => c.propertyId))];
      if (propertyIds.length > 0) {
          const propertiesQuery = query(collection(db, 'properties'), where('__name__', 'in', propertyIds));
          const propertiesSnapshot = await getDocs(propertiesQuery);
          const propertiesList = propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Property));
          setProperties(propertiesList);
      }
      
      // Set the first active contract as selected by default
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

  const selectedContract = useMemo(() => {
    return activeContracts.find(c => c.id === selectedContractId) || null;
  }, [selectedContractId, activeContracts]);

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

  const handleDownloadPdf = () => {
    if (!selectedContract) return;
    const element = document.getElementById('printable-area');
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `documentacion_legal_${selectedContract.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Herramientas de Recuperación Legal</CardTitle>
          <CardDescription>
            Genere y gestione documentos clave para incumplimientos en contratos colaborativos. 
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
                  <SelectValue placeholder="Seleccione un contrato..." />
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
              <Button variant="outline" onClick={handleDownloadPdf} disabled={!selectedContract}>
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
        <Tabs defaultValue="prior_notice" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prior_notice">Notificación Previa</TabsTrigger>
              <TabsTrigger value="legal_dossier">Dossier Legal</TabsTrigger>
              <TabsTrigger value="contract_display">Visualizar Contrato</TabsTrigger>
            </TabsList>
            <div id="printable-area">
                <TabsContent value="prior_notice">
                   <PriorNotice contract={selectedContract} />
                </TabsContent>
                <TabsContent value="legal_dossier">
                  <LegalDossier contract={selectedContract} />
                </TabsContent>
                <TabsContent value="contract_display">
                  <ContractDisplay contract={selectedContract} property={selectedProperty} />
                </TabsContent>
            </div>
        </Tabs>
      ) : (
         <Alert variant="default" className="mt-6 border-dashed">
            <FileWarning className="h-4 w-4" />
            <AlertTitle>Seleccione un Contrato</AlertTitle>
            <AlertDescription>
                Por favor, elija un contrato de la lista superior para generar los documentos. Esta sección solo aplica a contratos en estado "Activo" y de tipo "colaborativo".
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
    </div>
  );
}
