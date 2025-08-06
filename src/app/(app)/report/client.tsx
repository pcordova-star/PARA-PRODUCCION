
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, TenantCertificateData, Contract, Property, Evaluation, Payment, Incident, TenantRentalHistory, TenantEvaluationsSummary, TenantPaymentsSummary, TenantIncidentsSummary, ContractReportData } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer, Loader2, AlertCircle, Star, AlertOctagon, Calendar, Building, User as UserIcon, Mail, ShieldAlert, CreditCard } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';

// Helper to safely format dates, defaulting to 'N/A'
const formatDateSafe = (dateInput: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateInput) return 'N/A';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
     if (isNaN(date.getTime())) {
      return "Fecha Inválida";
    }
    return date.toLocaleDateString('es-CL', options || { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    return 'Fecha Inválida';
  }
};

const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pendiente': "bg-yellow-100 text-yellow-800",
      'aceptado': "bg-green-100 text-green-800",
      'respondido': "bg-blue-100 text-blue-800",
      'cerrado': "bg-gray-100 text-gray-800",
    };
    return <Badge className={`${statusMap[status] || 'bg-gray-200'} capitalize`}>{status.replace(/_/g, ' ')}</Badge>;
};

async function fetchTenantReportData(tenantUid: string): Promise<TenantCertificateData | null> {
  try {
    const userDocRef = doc(db, 'users', tenantUid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists() || userDoc.data().role !== 'Arrendatario') {
      return null;
    }
    const tenantProfile: UserProfile = { uid: tenantUid, ...userDoc.data() } as UserProfile;

    const contractsQuery = query(collection(db, 'contracts'), where('tenantId', '==', tenantUid), orderBy('startDate', 'asc'));
    const contractsSnapshot = await getDocs(contractsQuery);
    const contracts = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));

    const contractIds = contracts.map(c => c.id);
    if (contractIds.length === 0) {
      return {
        tenantProfile: { ...tenantProfile, createdAt: formatDateSafe(tenantProfile.createdAt) },
        contractsData: [],
        globalScore: null, generationDate: formatDateSafe(new Date()),
        certificateId: `SARA-INF-${tenantUid.substring(0,5)}-${Date.now().toString().slice(-5)}`,
      };
    }

    const [evaluationsSnapshot, paymentsSnapshot, incidentsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'evaluations'), where('contractId', 'in', contractIds))),
      getDocs(query(collection(db, 'payments'), where('contractId', 'in', contractIds))),
      getDocs(query(collection(db, 'incidents'), where('contractId', 'in', contractIds)))
    ]);

    const allEvaluations = evaluationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Evaluation));
    const allPayments = paymentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Payment));
    const allIncidents = incidentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident));

    const contractsData: ContractReportData[] = await Promise.all(contracts.map(async contract => {
        const landlordDoc = await getDoc(doc(db, 'users', contract.landlordId));
        const landlordEmail = landlordDoc.exists() ? landlordDoc.data().email : 'N/A';
        
        const contractEvaluations = allEvaluations.filter(e => e.contractId === contract.id);
        const contractPayments = allPayments.filter(p => p.contractId === contract.id);
        const contractIncidents = allIncidents.filter(i => i.contractId === contract.id);

        return {
            contract,
            landlordEmail,
            evaluations: contractEvaluations,
            payments: contractPayments,
            incidents: contractIncidents,
        };
    }));

    const globalScore = allEvaluations.length > 0
        ? allEvaluations.reduce((sum, e) => sum + (e.criteria.paymentPunctuality + e.criteria.propertyCare + e.criteria.communication + e.criteria.generalBehavior) / 4, 0) / allEvaluations.length
        : null;

    return {
      tenantProfile: { ...tenantProfile, createdAt: formatDateSafe(tenantProfile.createdAt) },
      contractsData,
      globalScore,
      generationDate: formatDateSafe(new Date()),
      certificateId: `SARA-INF-${tenantUid.substring(0,5)}-${Date.now().toString().slice(-5)}`,
    };

  } catch (error) {
    console.error("Error fetching tenant report data from Firestore:", error);
    return null;
  }
}

export default function TenantReportClient() {
  const [reportData, setReportData] = useState<TenantCertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === 'Arrendatario') {
      fetchTenantReportData(currentUser.uid)
        .then(data => {
          if (data) {
            setReportData(data);
          } else {
            setError("No se pudieron cargar los datos del informe. Verifica que tu perfil esté completo.");
          }
        })
        .catch(err => {
          console.error("Error fetching report data:", err);
          setError("Ocurrió un error al generar el informe.");
        })
        .finally(() => setIsLoading(false));
    } else if (currentUser && currentUser.role !== 'Arrendatario') {
        setError("Esta función solo está disponible para arrendatarios.");
        setIsLoading(false);
    } else if (!currentUser) {
        setError("Debes iniciar sesión para generar tu informe.");
        setIsLoading(false);
    }
  }, [currentUser]);

  const handlePrint = () => {
    alert('Para imprimir o guardar como PDF, por favor use la función de impresión de su navegador (Ctrl+P o Cmd+P).');
  };

  if (isLoading) {
    return <div className="flex flex-col items-center justify-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg text-muted-foreground">Generando tu informe...</p></div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center py-10 text-destructive"><AlertCircle className="h-12 w-12 mb-4" /><p className="text-lg font-semibold">Error al generar informe</p><p>{error}</p></div>;
  }

  if (!reportData) {
    return <p className="py-10 text-center text-muted-foreground">No hay datos disponibles para generar el informe.</p>;
  }

  const { tenantProfile, contractsData, globalScore, generationDate, certificateId } = reportData;

  const renderStars = (score: number | null, maxStars = 5) => {
    if (score === null || isNaN(score)) return <span className="text-muted-foreground">N/A</span>;
    const fullStars = Math.round(score);
    const emptyStars = maxStars - fullStars;
    return (
      <span className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
        {Array(emptyStars).fill(0).map((_, i) => <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />)}
        <span className="ml-2 text-sm font-medium">({score.toFixed(1)}/{maxStars})</span>
      </span>
    );
  };
  
  return (
    <div className="bg-white p-6 md:p-10 rounded-lg shadow-xl mt-6 printable-certificate">
      <header className="flex flex-col items-center justify-between border-b-2 border-primary pb-6 mb-8 sm:flex-row">
        <div className='text-center sm:text-left'>
          <h1 className="text-3xl font-bold text-primary font-headline">Informe de Comportamiento</h1>
          <p className="text-lg text-muted-foreground">S.A.R.A - Sistema de Administración Responsable de Arriendos</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-primary mt-4 sm:mt-0"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
        <p><strong>Fecha de Emisión:</strong> {generationDate}</p>
        <p><strong>ID del Informe:</strong> <span className="font-mono">{certificateId}</span></p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Datos del Arrendatario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <p><strong>Nombre Completo:</strong> {tenantProfile.name || 'N/A'}</p>
          <p><strong>RUT:</strong> {tenantProfile.rut || 'N/A'}</p>
          <p><strong>Correo Electrónico:</strong> {tenantProfile.email || 'N/A'}</p>
          <p><strong>Miembro S.A.R.A desde:</strong> {tenantProfile.createdAt || 'N/A'}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Historial de Arriendos en la Plataforma</h2>
        {contractsData.length > 0 ? (
          <div className="space-y-6">
            {contractsData.map(({ contract, landlordEmail, evaluations, payments, incidents }, index) => {
              const totalPaymentsDeclared = payments.length;
              const acceptedPayments = payments.filter(p => p.status === 'aceptado');
              const totalAmountAccepted = acceptedPayments.reduce((sum, p) => sum + p.amount, 0);
              const totalOverduePayments = payments.filter(p => p.isOverdue).length;
              const avgRating = evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + (e.criteria.paymentPunctuality + e.criteria.propertyCare + e.criteria.communication + e.criteria.generalBehavior) / 4, 0) / evaluations.length) : null;

              return (
              <div key={index} className="p-4 border rounded-lg bg-muted/30 text-sm break-inside-avoid-page">
                <h3 className="text-lg font-semibold text-primary/90 mb-3 border-b pb-2">Contrato #{index + 1}: {contract.propertyName}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                    <p className="flex items-center"><Building className="h-4 w-4 mr-2 text-muted-foreground"/><strong>Propiedad:</strong><span className="ml-2">{contract.propertyAddress}</span></p>
                    <p className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-muted-foreground"/><strong>Periodo:</strong><span className="ml-2">{formatDateSafe(contract.startDate)} - {formatDateSafe(contract.endDate)}</span></p>
                    <p className="flex items-center"><UserIcon className="h-4 w-4 mr-2 text-muted-foreground"/><strong>Arrendador:</strong><span className="ml-2">{contract.landlordName}</span></p>
                    <p className="flex items-center"><Mail className="h-4 w-4 mr-2 text-muted-foreground"/><strong>Email Arrendador:</strong><span className="ml-2">{landlordEmail}</span></p>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><Star className="h-4 w-4 mr-2 text-yellow-400"/>Resumen de Evaluaciones</h4>
                        {evaluations.length > 0 && avgRating !== null ? (
                            <div className="pl-4">
                                <p><strong>Promedio de Calificaciones:</strong> {renderStars(avgRating)}</p>
                                {evaluations.some(e => e.tenantComment) && (
                                    <div className="mt-2"><h5 className="font-medium text-xs mb-1">Comentarios Destacados:</h5>
                                        {evaluations.filter(e => e.tenantComment).slice(0, 1).map((e, i) => (
                                            <blockquote key={i} className="text-xs border-l-2 pl-2 italic text-muted-foreground">"{e.tenantComment}"</blockquote>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : <p className="text-xs text-muted-foreground pl-4">No hay evaluaciones para este contrato.</p>}
                    </div>

                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><CreditCard className="h-4 w-4 mr-2 text-green-600"/>Resumen de Pagos</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pl-4">
                            <p><strong>Declarados:</strong> {totalPaymentsDeclared}</p>
                            <p><strong>Aceptados:</strong> {acceptedPayments.length}</p>
                            <p><strong>Monto Total Aceptado:</strong> ${totalAmountAccepted.toLocaleString('es-CL')}</p>
                            <p><strong>Pagos con Atraso:</strong> {totalOverduePayments}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><ShieldAlert className="h-4 w-4 mr-2 text-red-600"/>Resumen de Incidentes</h4>
                        {incidents.length > 0 ? (
                            <div className="relative w-full overflow-auto bg-white">
                                <Table>
                                    <TableHeader><TableRow><TableHead className="h-8 text-xs">Fecha</TableHead><TableHead className="h-8 text-xs">Tipo</TableHead><TableHead className="h-8 text-xs">Reportado Por</TableHead><TableHead className="h-8 text-xs">Estado</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {incidents.map(i => (
                                            <TableRow key={i.id}><TableCell className="py-1 text-xs">{formatDateSafe(i.createdAt)}</TableCell><TableCell className="py-1 text-xs capitalize">{i.type}</TableCell><TableCell className="py-1 text-xs">{i.createdBy === tenantProfile.uid ? 'Arrendatario' : 'Arrendador'}</TableCell><TableCell className="py-1 text-xs">{getStatusBadge(i.status)}</TableCell></TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : <p className="text-xs text-muted-foreground pl-4">No hay incidentes para este contrato.</p>}
                    </div>
                </div>
              </div>
            )})}
          </div>
        ) : <p className="text-sm text-muted-foreground">No hay historial de arriendos disponible.</p>}
      </section>

      <section className="mb-8 pt-6 border-t-2 border-primary">
         <div className="flex flex-col items-center sm:flex-row justify-between gap-6">
            <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold text-primary mb-2">Puntuación Global del Arrendatario</h2>
                {globalScore !== null ? (
                    <div className="flex items-center justify-center sm:justify-start">
                        {renderStars(globalScore, 5)}
                        <span className="text-3xl font-bold text-primary ml-3">{globalScore.toFixed(1)} <span className="text-lg">/ 5.0</span></span>
                    </div>
                ) : <p className="text-lg text-muted-foreground">Puntuación global no disponible.</p>}
                <p className="text-xs text-muted-foreground mt-1">Basado en el promedio de todas las evaluaciones recibidas en la plataforma.</p>
            </div>
            <div className="flex flex-col items-center">
                 <img src="https://placehold.co/100x100.png" alt="QR Code de Verificación" width={100} height={100} data-ai-hint="qr code verification" />
                 <p className="text-xs text-muted-foreground mt-1">Escanear para verificar (simulado)</p>
            </div>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t text-center">
        <p className="text-xs text-muted-foreground">Este informe es generado automáticamente por S.A.R.A y se basa en la información registrada en la plataforma hasta la fecha de emisión. S.A.R.A no se hace responsable por la veracidad de la información ingresada por los usuarios.</p>
        <p className="text-xs text-primary mt-1">contacto@sara-app.com | www.sara-app.com (Sitio ficticio)</p>
      </footer>
      
       <div className="mt-8 text-center print:hidden">
        <Button onClick={handlePrint} size="lg"><Printer className="mr-2 h-5 w-5" /> Imprimir / Guardar como PDF</Button>
      </div>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .printable-certificate { margin: 0; padding: 20px; border: none; box-shadow: none; }
          .print\\:hidden { display: none !important; }
          .break-inside-avoid-page { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
