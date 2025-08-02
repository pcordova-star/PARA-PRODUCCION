"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Home, Wallet, Award, Download, Calendar, AlertTriangle } from "lucide-react"; 
import type { Contract, Evaluation, UserProfile } from "@/types";
import { Badge } from "@/components/ui/badge"; 
import { AnnouncementsSection } from "./announcements-section";
import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// MOCK DATA
const mockUser: UserProfile = { uid: 'user_tenant_456', role: 'Arrendatario', name: 'Juan Pérez', email: 'juan@sara.com' };
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
  },
   {
    id: 'CTR-004',
    propertyId: '4',
    propertyAddress: 'Calle de la Amargura 123',
    propertyName: 'Casa en Ñuñoa',
    landlordId: 'user_landlord_789',
    landlordName: 'Laura Propietaria',
    tenantId: 'user_tenant_456',
    tenantName: 'Juan Pérez',
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2025-07-31T00:00:00Z',
    rentAmount: 850000,
    status: 'Borrador',
    propertyUsage: 'Habitacional',
    tenantEmail: 'juan.perez@email.com',
    tenantRut: '11.111.111-1',
  }
];

const mockEvaluations: Evaluation[] = [
  {
    id: 'EVAL-001',
    contractId: 'CTR-OLD-001',
    propertyId: '10',
    propertyName: 'Depto. Antiguo',
    landlordId: 'user_landlord_123',
    landlordName: 'Carlos Arrendador',
    tenantId: 'user_tenant_456',
    tenantName: 'Juan Pérez',
    evaluationDate: '2023-01-20T00:00:00Z',
    status: 'recibida',
    criteria: {
      paymentPunctuality: 5,
      propertyCare: 4,
      communication: 5,
      generalBehavior: 5,
    },
  },
];


const ScoreDisplay = ({ score }: { score: number | null }) => {
  if (score === null) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-lg aspect-square w-full h-auto max-h-[300px] text-muted-foreground p-4 shadow">
        <div className="text-center">
          <Award className="h-16 w-16 mx-auto mb-2 text-primary/70" />
          <p className="text-xl font-semibold">Sin Calificación</p>
          <p className="text-sm">Aún no hay evaluaciones disponibles.</p>
        </div>
      </div>
    );
  }
  let scoreColor = score >= 4 ? "text-green-600" : score >= 3 ? "text-yellow-500" : "text-red-600";
  return (
    <div className="flex items-center justify-center bg-card rounded-lg aspect-square w-full h-auto max-h-[300px] p-4 shadow">
      <svg viewBox="0 0 120 120" className="w-full h-full max-w-[200px] max-h-[200px]">
        <circle cx="60" cy="60" r="55" fill="hsl(var(--background))" strokeWidth="4" className="stroke-primary/30" />
        <circle 
            cx="60" cy="60" r="50" fill="transparent" strokeWidth="8" 
            className={`stroke-current ${scoreColor.replace('text-', 'stroke-')}`}
            strokeDasharray={`${(score / 5.0) * (2 * Math.PI * 50)} ${2 * Math.PI * 50}`}
            strokeLinecap="round" transform="rotate(-90 60 60)" />
        <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle" className={`fill-current ${scoreColor} font-bold text-4xl`}>{score.toFixed(1)}</text>
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" className="fill-current text-muted-foreground font-semibold text-lg">/ 5.0</text>
      </svg>
    </div>
  );
};


export function TenantDashboard() {
  const [globalScore, setGlobalScore] = useState<number | null>(null);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [pendingContract, setPendingContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Simulate API Fetch
    await new Promise(resolve => setTimeout(resolve, 1000));

    const active = mockContracts.find(c => c.status === 'Activo');
    const pending = mockContracts.find(c => c.status === 'Borrador');
    setActiveContract(active || null);
    setPendingContract(pending || null);

    if (mockEvaluations.length > 0) {
      const numEvals = mockEvaluations.length;
      const avgPunctuality = mockEvaluations.reduce((sum, e) => sum + e.criteria.paymentPunctuality, 0) / numEvals;
      const avgPropertyCare = mockEvaluations.reduce((sum, e) => sum + e.criteria.propertyCare, 0) / numEvals;
      const avgCommunication = mockEvaluations.reduce((sum, e) => sum + e.criteria.communication, 0) / numEvals;
      const avgGeneralBehavior = mockEvaluations.reduce((sum, e) => sum + e.criteria.generalBehavior, 0) / numEvals;
      const overallAvg = (avgPunctuality + avgPropertyCare + avgCommunication + avgGeneralBehavior) / 4;
      setGlobalScore(parseFloat(overallAvg.toFixed(1)));
    } else {
      setGlobalScore(null);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Panel de Arrendatario</CardTitle>
          <CardDescription>Bienvenido a tu espacio en S.A.R.A.</CardDescription>
        </CardHeader>
        {pendingContract && (
          <CardContent>
            <Link href="/contracts">
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-4 hover:bg-yellow-200/50 transition-colors">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">¡Tienes un contrato pendiente!</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Un arrendador te ha enviado un nuevo contrato para su revisión y aprobación.</p>
                </div>
              </div>
            </Link>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Acciones Rápidas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild size="lg" className="h-auto py-3"><Link href="/contracts"><FileText className="mr-2" /><span>Mis Contratos</span></Link></Button>
            <Button asChild size="lg" className="h-auto py-3"><Link href="/payments"><Wallet className="mr-2" /><span>Declarar Pago</span></Link></Button>
            <Button asChild size="lg" className="h-auto py-3"><Link href="/incidents"><AlertTriangle className="mr-2" /><span>Reportar Incidente</span></Link></Button>
            <Button asChild size="lg" className="h-auto py-3"><Link href="/evaluations"><Award className="mr-2" /><span>Mis Evaluaciones</span></Link></Button>
            <Button asChild size="lg" className="h-auto py-3"><Link href="/calendar"><Calendar className="mr-2" /><span>Calendario</span></Link></Button>
            <Button asChild size="lg" className="h-auto py-3"><Link href="/certificate"><Download className="mr-2" /><span>Certificado</span></Link></Button>
          </CardContent>
        </Card>

        <AnnouncementsSection />
      </div>
      
      {activeContract ? (
        <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tu Arriendo Actual</CardTitle>
              <CardDescription>{activeContract.propertyName}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg mb-4"><ScoreDisplay score={globalScore} /></div>
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold">Estado:</span> <Badge className="bg-green-100 text-green-800 border-green-200">{activeContract.status}</Badge></p>
                <p><span className="font-semibold">Propietario:</span> {activeContract.landlordName || "N/A"}</p>
                <p><Wallet className="inline h-4 w-4 mr-2" /> <span className="font-semibold">Renta:</span> ${activeContract.rentAmount.toLocaleString('es-CL')}</p>
                <p><Calendar className="inline h-4 w-4 mr-2" /> <span className="font-semibold">Fin de Contrato:</span> {new Date(activeContract.endDate).toLocaleDateString('es-CL')}</p>
                <Button asChild className="w-full mt-4"><Link href={`/contracts/${activeContract.id}`}><FileText className="mr-2 h-4 w-4" /> Ver Detalles del Contrato</Link></Button>
              </div>
            </CardContent>
        </Card>
      ) : !pendingContract && (
        <Card className="shadow-lg">
          <CardContent className="text-center py-8">
            <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No tienes contratos activos en este momento.</p>
            <p className="text-muted-foreground">Cuando un arrendador te envíe un contrato, aparecerá aquí.</p>
          </CardContent>
        </Card>
      )}
    </div>
    </TooltipProvider>
  );
}
