
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, TenantCertificateData, Contract, Property, Evaluation, Payment, Incident, TenantRentalHistory, TenantEvaluationsSummary, TenantPaymentsSummary, TenantIncidentsSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer, Loader2, AlertCircle, Star, AlertOctagon } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Helper to safely format dates, defaulting to 'N/A'
const formatDateSafe = (dateInput: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateInput) return 'N/A';
  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString('es-CL', options || { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    return 'Fecha Inválida';
  }
};

async function fetchTenantCertificateData(tenantUid: string): Promise<TenantCertificateData | null> {
  try {
    const userDocRef = doc(db, 'users', tenantUid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists() || userDoc.data().role !== 'Arrendatario') {
      return null;
    }
    const tenantProfile: UserProfile = { uid: tenantUid, ...userDoc.data() } as UserProfile;

    const contractsQuery = query(collection(db, 'contracts'), where('tenantId', '==', tenantUid));
    const contractsSnapshot = await getDocs(contractsQuery);
    const contracts = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));

    const contractIds = contracts.map(c => c.id);
    if (contractIds.length === 0) {
      // Return basic data if no contracts
      return {
        tenantProfile: { ...tenantProfile, createdAt: formatDateSafe(tenantProfile.createdAt) },
        rentalHistory: [], evaluationsSummary: { evaluations: [], averageCommunication: null, averageGeneralBehavior: null, averagePropertyCare: null, averagePunctuality: null, overallAverage: null },
        paymentsSummary: { compliancePercentage: null, overduePaymentsPercentage: null, totalAmountAccepted: 0, totalOverduePayments: 0, totalPaymentsAccepted: 0, totalPaymentsDeclared: 0 },
        incidentsSummary: { incidentsReceivedByTenant: 0, incidentsReportedByTenant: 0, incidentsResolved: 0, totalIncidentsInvolved: 0 },
        globalScore: null, generationDate: formatDateSafe(new Date()),
        certificateId: `SARA-CERT-${tenantUid.substring(0,5)}-${Date.now().toString().slice(-5)}`,
      };
    }

    // Rental History
    const rentalHistory: TenantRentalHistory[] = contracts.map(c => ({
      contractId: c.id,
      propertyAddress: c.propertyAddress,
      startDate: formatDateSafe(c.startDate),
      endDate: formatDateSafe(c.endDate),
      landlordName: c.landlordName,
    }));

    // Evaluations
    const evaluationsQuery = query(collection(db, 'evaluations'), where('contractId', 'in', contractIds));
    const evaluationsSnapshot = await getDocs(evaluationsQuery);
    const evaluations = evaluationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Evaluation));
    
    let evaluationsSummary: TenantEvaluationsSummary;
    if (evaluations.length > 0) {
      const numEvals = evaluations.length;
      const avgPunctuality = evaluations.reduce((sum, e) => sum + e.criteria.paymentPunctuality, 0) / numEvals;
      const avgPropertyCare = evaluations.reduce((sum, e) => sum + e.criteria.propertyCare, 0) / numEvals;
      const avgCommunication = evaluations.reduce((sum, e) => sum + e.criteria.communication, 0) / numEvals;
      const avgGeneralBehavior = evaluations.reduce((sum, e) => sum + e.criteria.generalBehavior, 0) / numEvals;
      evaluationsSummary = {
        evaluations,
        averagePunctuality,
        averagePropertyCare,
        averageCommunication,
        averageGeneralBehavior,
        overallAverage: (avgPunctuality + avgPropertyCare + avgCommunication + avgGeneralBehavior) / 4,
      };
    } else {
        evaluationsSummary = { evaluations: [], averagePunctuality: null, averagePropertyCare: null, averageCommunication: null, averageGeneralBehavior: null, overallAverage: null };
    }


    // Payments
    const paymentsQuery = query(collection(db, 'payments'), where('contractId', 'in', contractIds));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const payments = paymentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Payment));
    
    const totalPaymentsDeclared = payments.length;
    const acceptedPayments = payments.filter(p => p.status === 'aceptado');
    const totalPaymentsAccepted = acceptedPayments.length;
    const totalAmountAccepted = acceptedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOverduePayments = payments.filter(p => p.isOverdue).length;
    const paymentsSummary: TenantPaymentsSummary = {
      totalPaymentsDeclared, totalPaymentsAccepted, totalAmountAccepted,
      compliancePercentage: totalPaymentsDeclared > 0 ? (totalPaymentsAccepted / totalPaymentsDeclared) * 100 : 100,
      totalOverduePayments,
      overduePaymentsPercentage: totalPaymentsDeclared > 0 ? (totalOverduePayments / totalPaymentsDeclared) * 100 : 0,
    };
    
    // Incidents
    const incidentsQuery = query(collection(db, 'incidents'), where('contractId', 'in', contractIds));
    const incidentsSnapshot = await getDocs(incidentsQuery);
    const incidents = incidentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident));
    const incidentsSummary: TenantIncidentsSummary = {
      totalIncidentsInvolved: incidents.length,
      incidentsReportedByTenant: incidents.filter(i => i.createdBy === tenantUid).length,
      incidentsReceivedByTenant: incidents.filter(i => i.createdBy !== tenantUid).length,
      incidentsResolved: incidents.filter(i => i.status === 'cerrado').length,
    };

    return {
      tenantProfile: { ...tenantProfile, createdAt: formatDateSafe(tenantProfile.createdAt) },
      rentalHistory, evaluationsSummary, paymentsSummary, incidentsSummary,
      globalScore: evaluationsSummary.overallAverage,
      generationDate: formatDateSafe(new Date()),
      certificateId: `SARA-CERT-${tenantUid.substring(0,5)}-${Date.now().toString().slice(-5)}`,
    };

  } catch (error) {
    console.error("Error fetching tenant certificate data from Firestore:", error);
    return null;
  }
}

export default function TenantCertificateClient() {
  const [certificateData, setCertificateData] = useState<TenantCertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === 'Arrendatario') {
      fetchTenantCertificateData(currentUser.uid)
        .then(data => {
          if (data) {
            setCertificateData(data);
          } else {
            setError("No se pudieron cargar los datos del certificado. Verifica que tu perfil esté completo.");
          }
        })
        .catch(err => {
          console.error("Error fetching certificate data:", err);
          setError("Ocurrió un error al generar el certificado.");
        })
        .finally(() => setIsLoading(false));
    } else if (currentUser && currentUser.role !== 'Arrendatario') {
        setError("Esta función solo está disponible para arrendatarios.");
        setIsLoading(false);
    } else if (!currentUser) {
        // This case is handled by the AppLayout, but good to have a fallback.
        setError("Debes iniciar sesión para generar tu certificado.");
        setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Generando tu certificado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-destructive">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">Error al generar certificado</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!certificateData) {
    return <p className="py-10 text-center text-muted-foreground">No hay datos disponibles para generar el certificado.</p>;
  }

  const { 
    tenantProfile, rentalHistory, evaluationsSummary, paymentsSummary, incidentsSummary, 
    globalScore, generationDate, certificateId 
  } = certificateData;

  const renderStars = (score: number | null, maxStars = 5) => {
    if (score === null || isNaN(score)) return <span className="text-muted-foreground">N/A</span>;
    const fullStars = Math.floor(score);
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
          <h1 className="text-3xl font-bold text-primary font-headline">Certificado de Comportamiento</h1>
          <p className="text-lg text-muted-foreground">S.A.R.A - Sistema de Administración Responsable de Arriendos</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-primary mt-4 sm:mt-0"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
        <p><strong>Fecha de Emisión:</strong> {generationDate}</p>
        <p><strong>ID del Certificado:</strong> <span className="font-mono">{certificateId}</span></p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Datos del Arrendatario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <p><strong>Nombre Completo:</strong> {tenantProfile.name || 'N/A'}</p>
          <p><strong>Correo Electrónico:</strong> {tenantProfile.email || 'N/A'}</p>
          <p><strong>Miembro S.A.R.A desde:</strong> {tenantProfile.createdAt || 'N/A'}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Historial de Arriendos</h2>
        {rentalHistory.length > 0 ? (
          <div className="space-y-4">
            {rentalHistory.map((item, index) => (
              <div key={index} className="p-3 border rounded-md bg-muted/30 text-sm">
                <p><strong>Propiedad:</strong> {item.propertyAddress}</p>
                <p><strong>Periodo:</strong> {item.startDate} - {item.endDate}</p>
                <p><strong>Arrendador:</strong> {item.landlordName}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">No hay historial de arriendos disponible.</p>}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Resumen de Evaluaciones</h2>
        {evaluationsSummary.evaluations.length > 0 && evaluationsSummary.overallAverage !== null ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <p><strong>Puntualidad en Pagos:</strong> {renderStars(evaluationsSummary.averagePunctuality)}</p>
              <p><strong>Cuidado de la Propiedad:</strong> {renderStars(evaluationsSummary.averagePropertyCare)}</p>
              <p><strong>Comunicación:</strong> {renderStars(evaluationsSummary.averageCommunication)}</p>
              <p><strong>Convivencia General:</strong> {renderStars(evaluationsSummary.averageGeneralBehavior)}</p>
            </div>
             <div className="mt-4 pt-3 border-t">
                <p className="text-md font-semibold">Promedio General de Evaluaciones:</p>
                {renderStars(evaluationsSummary.overallAverage)}
            </div>
            {evaluationsSummary.evaluations.some(e => e.tenantComment) && (
              <div className="mt-3">
                <h3 className="font-medium text-sm mb-1">Comentarios Destacados del Arrendatario:</h3>
                {evaluationsSummary.evaluations.filter(e=>e.tenantComment).slice(0,2).map((e,i) => (
                  <blockquote key={i} className="text-xs border-l-2 pl-2 italic text-muted-foreground mb-1">"{e.tenantComment}" <span className="text-primary/80">- Respecto a Propiedad {e.propertyName}</span></blockquote>
                ))}
              </div>
            )}
          </div>
        ) : <p className="text-sm text-muted-foreground">No hay evaluaciones disponibles.</p>}
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Resumen de Pagos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <p><strong>Pagos Declarados:</strong> {paymentsSummary.totalPaymentsDeclared}</p>
            <p><strong>Pagos Aceptados:</strong> {paymentsSummary.totalPaymentsAccepted}</p>
            <p><strong>Monto Total Aceptado:</strong> ${paymentsSummary.totalAmountAccepted.toLocaleString('es-CL')}</p>
            <p><strong>Cumplimiento de Declaraciones:</strong> {paymentsSummary.compliancePercentage !== null ? `${paymentsSummary.compliancePercentage.toFixed(1)}%` : 'N/A'}</p>
            <div className="flex items-center">
              <p><strong>Pagos Declarados con Atraso:</strong> {paymentsSummary.totalOverduePayments}</p>
              {paymentsSummary.overduePaymentsPercentage !== null && paymentsSummary.totalOverduePayments > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  <AlertOctagon className="h-3 w-3 mr-1" />
                  {paymentsSummary.overduePaymentsPercentage.toFixed(1)}% de los pagos
                </Badge>
              )}
            </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Resumen de Incidentes</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <p><strong>Incidentes Totales Involucrado:</strong> {incidentsSummary.totalIncidentsInvolved}</p>
            <p><strong>Incidentes Reportados por Arrendatario:</strong> {incidentsSummary.incidentsReportedByTenant}</p>
            <p><strong>Incidentes Recibidos por Arrendatario:</strong> {incidentsSummary.incidentsReceivedByTenant}</p>
            <p><strong>Incidentes Resueltos:</strong> {incidentsSummary.incidentsResolved}</p>
        </div>
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
                ) : (
                    <p className="text-lg text-muted-foreground">Puntuación global no disponible.</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Basado en el promedio de evaluaciones recibidas.</p>
            </div>
            <div className="flex flex-col items-center">
                 <img src="https://placehold.co/100x100.png" alt="QR Code de Verificación" width={100} height={100} data-ai-hint="qr code verification" />
                 <p className="text-xs text-muted-foreground mt-1">Escanear para verificar (simulado)</p>
            </div>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Este certificado es generado automáticamente por S.A.R.A y se basa en la información registrada en la plataforma hasta la fecha de emisión.
          S.A.R.A no se hace responsable por la veracidad de la información ingresada por los usuarios.
        </p>
        <p className="text-xs text-primary mt-1">contacto@sara-app.com | www.sara-app.com (Sitio ficticio)</p>
      </footer>
      
       <div className="mt-8 text-center print:hidden">
        <Button onClick={() => window.print()} size="lg">
          <Printer className="mr-2 h-5 w-5" /> Imprimir / Guardar como PDF
        </Button>
      </div>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .printable-certificate { margin: 0; padding: 20px; border: none; box-shadow: none; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

    