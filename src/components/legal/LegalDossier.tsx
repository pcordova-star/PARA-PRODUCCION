
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Contract, Incident, Payment, Evaluation } from '@/types';
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
}

export function LegalDossier({ contract }: LegalDossierProps) {
  const [dossierData, setDossierData] = useState<{
    payments: Payment[],
    incidents: Incident[],
    evaluations: Evaluation[]
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchDossierData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const paymentsQuery = query(collection(db, 'payments'), where('contractId', '==', contract.id), orderBy('paymentDate', 'desc'));
      const incidentsQuery = query(collection(db, 'incidents'), where('contractId', '==', contract.id), orderBy('createdAt', 'desc'));
      const evaluationsQuery = query(collection(db, 'evaluations'), where('contractId', '==', contract.id), orderBy('evaluationDate', 'desc'));

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
    return <Badge className={`${statusMap[status] || 'bg-gray-200'} capitalize`}>{status.replace(/_/g, ' ')}</Badge>;
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
      if (i.initialAttachmentUrl) attachments.push({ name: `Incidente ${i.id} (Inicial) - ${i.initialAttachmentName || 'adjunto'}`, url: i.initialAttachmentUrl });
      i.responses?.forEach((r, index) => {
          if (r.responseAttachmentUrl) attachments.push({ name: `Incidente ${i.id} (Respuesta ${index+1}) - ${r.responseAttachmentName || 'adjunto'}`, url: r.responseAttachmentUrl });
      });
      return attachments;
  });

  return (
    <div className="p-6 border rounded-md bg-background shadow mt-4 print:shadow-none print:border-none">
      <header className="text-center mb-8 print:mb-6">
        <h2 className="text-2xl font-bold text-primary font-headline">DOSSIER LEGAL</h2>
        <p className="text-md text-muted-foreground mt-1">Contrato: <span className="font-semibold">{contract.propertyName}</span></p>
        <p className="text-xs text-muted-foreground mt-2">Emitido el: {new Date().toLocaleDateString("es-CL", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="space-y-8">
        {/* Payments Section */}
        <section>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">Historial de Pagos</h3>
          {dossierData.payments.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Fecha Pago</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Monto</TableHead><TableHead>Estado</TableHead><TableHead>Comprobante</TableHead></TableRow></TableHeader>
              <TableBody>
                {dossierData.payments.map(p => (
                  <TableRow key={p.id}><TableCell>{formatDate(p.paymentDate)}</TableCell><TableCell className="capitalize">{p.type}</TableCell><TableCell className="text-right">{formatCurrency(p.amount)}</TableCell><TableCell>{getStatusBadge(p.status)}</TableCell><TableCell>{p.attachmentUrl ? <a href={p.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver</a> : 'No'}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No hay pagos registrados.</p>}
        </section>

        {/* Incidents Section */}
        <section>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">Historial de Incidentes</h3>
          {dossierData.incidents.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Reportado Por</TableHead><TableHead>Tipo</TableHead><TableHead>Descripción</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {dossierData.incidents.map(i => (
                  <TableRow key={i.id}><TableCell>{formatDate(i.createdAt)}</TableCell><TableCell>{i.createdBy === i.landlordId ? 'Arrendador' : 'Arrendatario'}</TableCell><TableCell className="capitalize">{i.type}</TableCell><TableCell className="max-w-xs truncate">{i.description}</TableCell><TableCell>{getStatusBadge(i.status)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No hay incidentes registrados.</p>}
        </section>

        {/* Evaluations Section */}
        <section>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">Historial de Evaluaciones</h3>
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

         {/* Attachments Section */}
        <section className="print:hidden">
            <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">Descarga de Evidencia Digital</h3>
            {(paymentAttachments.length > 0 || incidentAttachments.length > 0) ? (
                <div className="space-y-4">
                    {paymentAttachments.length > 0 && (
                        <div>
                            <h4 className="font-medium">Comprobantes de Pago</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                {paymentAttachments.map((p, i) => (
                                    <li key={`p-att-${i}`}>
                                        <a href={p.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Comprobante de {p.type} - {formatDate(p.paymentDate)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {incidentAttachments.length > 0 && (
                         <div>
                            <h4 className="font-medium">Adjuntos de Incidentes</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                {incidentAttachments.map((att, i) => (
                                    <li key={`i-att-${i}`}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {att.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : <p className="text-sm text-muted-foreground">No hay archivos adjuntos para este contrato.</p>}
        </section>
      </div>

      <footer className="mt-12 pt-6 border-t text-center print:mt-8 print:pt-4">
        <p className="text-xs text-muted-foreground">
          Dossier generado por S.A.R.A para el contrato ID: {contract.id}.
        </p>
      </footer>
    </div>
  );
}
