
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Contract, Incident, Payment, Evaluation, Property } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download, Star } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

interface LegalDossierProps {
  contract: Contract;
  property: Property | null;
}

export function LegalDossier({ contract, property }: LegalDossierProps) {
  const [dossierData, setDossierData] = useState<{
    payments: Payment[],
    incidents: Incident[],
    evaluations: Evaluation[]
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchDossierData = useCallback(async () => {
    if (!currentUser || !contract) return;
    setIsLoading(true);
    try {
      const contractId = contract.id;
      const paymentsQuery = query(collection(db, 'payments'), where('contractId', '==', contractId), orderBy('paymentDate', 'desc'));
      const incidentsQuery = query(collection(db, 'incidents'), where('contractId', '==', contractId), orderBy('createdAt', 'desc'));
      const evaluationsQuery = query(collection(db, 'evaluations'), where('contractId', '==', contractId), orderBy('evaluationDate', 'desc'));

      const [paymentsSnapshot, incidentsSnapshot, evaluationsSnapshot] = await Promise.all([
        getDocs(paymentsQuery),
        getDocs(incidentsQuery),
        getDocs(evaluationsQuery)
      ]);

      const paymentsList = paymentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Payment));
      const incidentsList = incidentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident));
      const evaluationsList = evaluationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Evaluation));

      setDossierData({ payments: paymentsList, incidents: incidentsList, evaluations: evaluationsList });
    } catch (error) {
      console.error("Error fetching dossier data:", error);
      toast({
        title: "Error al cargar el dossier",
        description: "No se pudo obtener el historial completo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contract, currentUser, toast]);


  useEffect(() => {
    fetchDossierData();
  }, [fetchDossierData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('es-CL'); } catch (e) { return 'Fecha Inválida'; }
  };
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('es-CL')}`;

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pendiente': "bg-yellow-100 text-yellow-800",
      'aceptado': "bg-green-100 text-green-800",
      'respondido': "bg-blue-100 text-blue-800",
      'cerrado': "bg-gray-100 text-gray-800",
      'recibida': "bg-green-100 text-green-800",
      'pendiente de confirmacion': "bg-yellow-100 text-yellow-800"
    };
    return <Badge className={`${statusMap[status] || 'bg-gray-200'} capitalize print:shadow-none print:border`}>{status.replace(/_/g, ' ')}</Badge>;
  };
  
  const calculateAverageRating = (criteria: Evaluation['criteria']): string => {
    const ratings = Object.values(criteria);
    if (ratings.length === 0) return 'N/A';
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };
  
  if (isLoading) {
    return <div className="p-6 text-center border rounded-md bg-background shadow mt-4"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> <p className="mt-2 text-muted-foreground">Cargando dossier legal...</p></div>;
  }
  
  if (!dossierData) {
     return <div className="p-6 text-center border rounded-md bg-background shadow mt-4"><p>No se encontraron datos para este contrato.</p></div>;
  }

  const paymentAttachments = dossierData.payments.filter(p => p.attachmentUrl);
  const incidentAttachments = dossierData.incidents.flatMap(i => {
      const attachments = [];
      if (i.initialAttachmentUrl) attachments.push({ name: `Incidente del ${formatDate(i.createdAt)} (Inicial) - ${i.initialAttachmentName || 'adjunto'}`, url: i.initialAttachmentUrl });
      i.responses?.forEach((r, index) => {
          if (r.responseAttachmentUrl) attachments.push({ name: `Incidente del ${formatDate(i.createdAt)} (Respuesta ${index+1}) - ${r.responseAttachmentName || 'adjunto'}`, url: r.responseAttachmentUrl });
      });
      return attachments;
  });

  return (
    <div className="p-6 border rounded-md bg-background shadow mt-4 print:shadow-none print:border-none font-serif text-gray-800 text-sm/relaxed">
      <header className="text-center mb-8 print:mb-6">
        <h2 className="text-2xl font-bold text-primary font-headline">DOSSIER LEGAL</h2>
        <p className="text-md text-muted-foreground mt-1">ID Contrato: <span className="font-semibold font-mono">{contract.id}</span></p>
        <p className="text-xs text-muted-foreground mt-2">Emitido el: {new Date().toLocaleDateString("es-CL", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>
      
      <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">I. Identificación del Contrato</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
             <p><strong>Propiedad:</strong> {contract.propertyAddress}</p>
             <p><strong>Período:</strong> {formatDate(contract.startDate)} al {formatDate(contract.endDate)}</p>
             <p><strong>Arrendador:</strong> {contract.landlordName} (RUT: {property?.ownerRut || 'N/A'})</p>
             <p><strong>Arrendatario:</strong> {contract.tenantName} (RUT: {contract.tenantRut})</p>
          </div>
      </section>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">II. Historial de Pagos</h3>
          <p className="text-xs text-muted-foreground mb-3 italic">
              Esta sección detalla todos los pagos declarados por el arrendatario y su estado de aceptación por parte del arrendador, registrados en la plataforma S.A.R.A.
          </p>
          {dossierData.payments.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Fecha Pago</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Monto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {dossierData.payments.map(p => (
                  <TableRow key={p.id}><TableCell>{formatDate(p.paymentDate)}</TableCell><TableCell className="capitalize">{p.type}</TableCell><TableCell className="text-right">{formatCurrency(p.amount)}</TableCell><TableCell>{getStatusBadge(p.status)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No hay pagos registrados.</p>}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">III. Historial de Incidentes</h3>
           <p className="text-xs text-muted-foreground mb-3 italic">
              Esta sección detalla todos los incidentes reportados por cualquiera de las partes durante la vigencia del contrato, incluyendo su descripción y estado de resolución.
          </p>
          {dossierData.incidents.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Reportado Por</TableHead><TableHead>Tipo</TableHead><TableHead className="w-[40%]">Descripción</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {dossierData.incidents.map(i => (
                  <TableRow key={i.id}><TableCell>{formatDate(i.createdAt)}</TableCell><TableCell>{i.createdBy === i.landlordId ? 'Arrendador' : 'Arrendatario'}</TableCell><TableCell className="capitalize">{i.type}</TableCell><TableCell className="whitespace-pre-wrap">{i.description}</TableCell><TableCell>{getStatusBadge(i.status)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No hay incidentes registrados.</p>}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">IV. Historial de Evaluaciones</h3>
          <p className="text-xs text-muted-foreground mb-3 italic">
              Esta sección muestra las evaluaciones de comportamiento realizadas por el arrendador hacia el arrendatario, como constancia del historial de conducta.
          </p>
          {dossierData.evaluations.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Rating Promedio</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {dossierData.evaluations.map(e => (
                  <TableRow key={e.id}><TableCell>{formatDate(e.evaluationDate)}</TableCell><TableCell><div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />{calculateAverageRating(e.criteria)}</div></TableCell><TableCell>{getStatusBadge(e.status)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No hay evaluaciones registradas.</p>}
        </section>

        <section>
            <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">V. Evidencia Digital Registrada</h3>
             <p className="text-xs text-muted-foreground mb-3 italic">
                A continuación se listan todos los documentos digitales adjuntados a pagos e incidentes en la plataforma, los cuales sirven como evidencia.
            </p>
            {(paymentAttachments.length > 0 || incidentAttachments.length > 0) ? (
                <div className="space-y-4 text-xs">
                    {paymentAttachments.length > 0 && (
                        <div>
                            <h4 className="font-medium underline">Comprobantes de Pago:</h4>
                            <ul className="list-decimal list-inside mt-2 space-y-1">
                                {paymentAttachments.map((p, i) => (
                                    <li key={`p-att-${i}`}>
                                        Comprobante de <span className="font-semibold">{p.type}</span> del <span className="font-semibold">{formatDate(p.paymentDate)}</span>.
                                        (<a href={p.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline print:no-underline print:text-black">Ver Archivo</a>)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {incidentAttachments.length > 0 && (
                         <div>
                            <h4 className="font-medium underline">Adjuntos de Incidentes:</h4>
                            <ul className="list-decimal list-inside mt-2 space-y-1">
                                {incidentAttachments.map((att, i) => (
                                    <li key={`i-att-${i}`}>
                                        Archivo adjunto: <span className="font-semibold">"{att.name}"</span>.
                                        (<a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline print:no-underline print:text-black">Ver Archivo</a>)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : <p className="text-sm text-muted-foreground">No hay archivos adjuntos registrados para este contrato.</p>}
        </section>
      </div>

      <footer className="mt-12 pt-6 border-t text-center print:mt-8 print:pt-4">
        <p className="text-xs text-muted-foreground">
          Fin del Dossier. Documento generado por S.A.R.A.
        </p>
      </footer>
    </div>
  );
}
