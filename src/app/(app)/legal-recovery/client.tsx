
"use client";

import React from "react";
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
import type html2pdf from 'html2pdf.js';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sendLegalAssistanceRequestEmail } from '@/lib/notifications';


export default function LegalRecoveryClient() {
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
  
  const handleSendToLawyer = async () => {
    if (!currentUser || !selectedContract) {
        toast({ title: 'Error', description: 'No se ha seleccionado ningún contrato o usuario no válido.', variant: 'destructive' });
        return;
    }
    setIsSending(true);
    try {
        await sendLegalAssistanceRequestEmail({
            landlordName: currentUser.name,
            landlordEmail: currentUser.email,
            contract: selectedContract,
        });
        toast({
            title: 'Solicitud Enviada',
            description: 'Tu solicitud de asesoría ha sido enviada al abogado en convenio. Te contactarán pronto.',
        });
    } catch (error) {
        console.error("Error sending legal request email:", error);
        toast({
            title: 'Error de Envío',
            description: 'No se pudo enviar la solicitud. Por favor, inténtalo de nuevo más tarde.',
            variant: 'destructive',
        });
    } finally {
        setIsSending(false);
        setIsSendDialogOpen(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedContract) return;

    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('printable-area');
    if (!element) {
        toast({
            title: "Error al generar PDF",
            description: "No se encontró el contenido para descargar.",
            variant: "destructive"
        });
        return;
    }

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `documentacion_legal_${selectedContract.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: true },
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
        <>
          <Tabs defaultValue="prior_notice" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prior_notice">Notificación Previa</TabsTrigger>
                <TabsTrigger value="legal_dossier">Dossier Legal</TabsTrigger>
                <TabsTrigger value="contract_display">Visualizar Contrato</TabsTrigger>
              </TabsList>
              <TabsContent value="prior_notice">
                 <PriorNotice contract={selectedContract} />
              </TabsContent>
              <TabsContent value="legal_dossier">
                <LegalDossier contract={selectedContract} property={selectedProperty}/>
              </TabsContent>
              <TabsContent value="contract_display">
                <ContractDisplay contract={selectedContract} property={selectedProperty} />
              </TabsContent>
          </Tabs>

          {/* Invisible container for PDF generation */}
          <div className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden opacity-0">
            <div id="printable-area" className="w-[210mm]">
                <ContractDisplay contract={selectedContract} property={selectedProperty} />
                <div className="break-after-page"></div>
                <LegalDossier contract={selectedContract} property={selectedProperty}/>
            </div>
          </div>

          <style jsx global>{`
              .break-after-page {
                  page-break-after: always;
              }
          `}</style>
        </>
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
              Esta acción enviará una solicitud de asesoría profesional al abogado en convenio de S.A.R.A, junto con los detalles de este caso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendToLawyer} disabled={isSending}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSending ? 'Enviando...' : 'Sí, enviar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    