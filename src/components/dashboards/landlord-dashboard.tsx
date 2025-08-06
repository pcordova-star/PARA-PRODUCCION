
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2, FileText, PlusCircle, Upload, Calendar, Wallet, AlertTriangle,
  BarChart, PieChart as PieChartIcon, ArrowRight
} from "lucide-react";
import type { Property, Contract, Payment, Incident, Evaluation, UserProfile } from "@/types";
import { AnnouncementsSection } from "./announcements-section";
import { BulkUploadModal } from "@/components/properties/bulk-upload-modal";
import { Skeleton } from "@/components/ui/skeleton";
import moment from 'moment';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from 'firebase/firestore';

const formatDate = (dateString: string) => {
    try {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('es-CL');
    } catch {
        return "Fecha Inválida";
    }
}

export function LandlordDashboard() {
  const { currentUser } = useAuth();
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch Properties
      const propertiesQuery = query(collection(db, 'properties'), where('ownerUid', '==', currentUser.uid));
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const propertiesList = propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Property));
      setProperties(propertiesList);
      
      // Fetch Contracts (including 'Borrador' for notifications)
      const contractsQuery = query(collection(db, 'contracts'), where('landlordId', '==', currentUser.uid), where('status', '!=', 'Archivado'));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setContracts(contractsList);
      
      const contractIds = contractsList.map(c => c.id);
      if (contractIds.length > 0) {
        // Fetch Payments
        const paymentsQuery = query(collection(db, 'payments'), where('contractId', 'in', contractIds));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        setPayments(paymentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Payment)));
        
        // Fetch Incidents
        const incidentsQuery = query(collection(db, 'incidents'), where('contractId', 'in', contractIds));
        const incidentsSnapshot = await getDocs(incidentsQuery);
        setIncidents(incidentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident)));
        
        // Fetch Evaluations
        const evaluationsQuery = query(collection(db, 'evaluations'), where('contractId', 'in', contractIds));
        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        setEvaluations(evaluationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Evaluation)));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadSuccess = () => {
    fetchData(); 
  };

  const activeContracts = contracts.filter(c => c.status === "Activo");
  const pendingContractsCount = contracts.filter(c => c.status === "Borrador").length;
  const expiringContractsCount = contracts.filter(c => {
    const endDate = moment(c.endDate);
    const now = moment();
    return c.status === "Activo" && endDate.isAfter(now) && endDate.isSameOrBefore(now.clone().add(3, 'months'), 'day');
  }).length;

  const openIncidentsCount = incidents.filter(i => i.status !== "cerrado").length;
  const pendingPaymentsCount = payments.filter(p => p.status === "pendiente").length;

  const currentMonthMoment = moment().startOf('month');
  const currentMonthPaymentsReceived = payments.filter(p => {
    const paymentMoment = moment(p.paymentDate);
    return p.status === "aceptado" && paymentMoment.isSame(currentMonthMoment, 'month');
  }).reduce((sum, payment) => sum + payment.amount, 0);

  const overallTenantScore = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum +
        ((e.criteria?.paymentPunctuality || 0) + (e.criteria?.propertyCare || 0) +
         (e.criteria?.communication || 0) + (e.criteria?.generalBehavior || 0)) / 4
      , 0) / evaluations.length).toFixed(1)
    : "N/A";

  const propertiesData = Object.entries(
    properties.reduce((acc, property) => {
      const status = property.status || "Desconocido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  const PROPERTIES_COLORS = { "Disponible": "#4b5563", "Arrendada": "#9ca3af", "Mantenimiento": "#d1d5db" };

  const contractsData = Object.entries(
    contracts.reduce((acc, contract) => {
       const status = contract.status || "Desconocido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  const CONTRACTS_COLORS = { "Activo": "#4b5563", "Borrador": "#9ca3af", "Finalizado": "#d1d5db", "Cancelado": "#6b7280" };

  const incidentsData = Object.entries(
    incidents.reduce((acc, incident) => {
       const status = incident.status || "Desconocido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  const INCIDENTS_COLORS = { "pendiente": "#6b7280", "respondido": "#9ca3af", "cerrado": "#d1d5db" };


  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="shadow-lg border-l-4 border-primary">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold font-headline text-primary">Panel de Arrendador</CardTitle>
            <CardDescription className="text-lg">Bienvenido a tu espacio de gestión centralizado en S.A.R.A.</CardDescription>
          </CardHeader>
          {(pendingContractsCount > 0 || pendingPaymentsCount > 0 || openIncidentsCount > 0 || expiringContractsCount > 0) && (
            <CardContent>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-bold text-lg text-yellow-700 dark:text-yellow-300">¡Atención Requerida!</p>
                  <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400">
                    {pendingPaymentsCount > 0 && <li><Link href="/payments" className="underline">Hay {pendingPaymentsCount} pago(s) pendiente(s) de aprobación.</Link></li>}
                    {openIncidentsCount > 0 && <li><Link href="/incidents" className="underline">Hay {openIncidentsCount} incidente(s) abierto(s) que requieren tu atención.</Link></li>}
                    {expiringContractsCount > 0 && <li><Link href="/contracts" className="underline">Tienes {expiringContractsCount} contrato(s) próximos a vencer.</Link></li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader><CardTitle className="flex items-center"><PlusCircle className="mr-2"/>Acciones Rápidas</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                  <Tooltip><TooltipTrigger asChild><Button asChild size="lg" className="h-auto py-3"><Link href="/properties"><Building2 className="mr-2" /><span>Gestionar Propiedades</span></Link></Button></TooltipTrigger><TooltipContent><p>Crea, edita y administra tus propiedades.</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button asChild size="lg" className="h-auto py-3"><Link href="/contracts"><FileText className="mr-2" /><span>Ver Contratos</span></Link></Button></TooltipTrigger><TooltipContent><p>Revisa y gestiona todos tus contratos de arriendo.</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button asChild size="lg" className="h-auto py-3"><Link href="/payments"><Wallet className="mr-2" /><span>Revisar Pagos</span></Link></Button></TooltipTrigger><TooltipContent><p>Aprueba los pagos declarados por tus arrendatarios.</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button asChild size="lg" className="h-auto py-3"><Link href="/evaluations"><Wallet className="mr-2" /><span>Evaluar Arrendatario</span></Link></Button></TooltipTrigger><TooltipContent><p>Califica el comportamiento de tus arrendatarios al finalizar un contrato.</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button asChild size="lg" className="h-auto py-3"><Link href="/calendar"><Calendar className="mr-2" /><span>Calendario</span></Link></Button></TooltipTrigger><TooltipContent><p>Visualiza fechas importantes de pagos y contratos.</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button onClick={() => setIsBulkUploadModalOpen(true)} size="lg" className="h-auto py-3"><Upload className="mr-2" /><span>Carga Masiva</span></Button></TooltipTrigger><TooltipContent><p>Añade múltiples propiedades a la vez usando un archivo.</p></TooltipContent></Tooltip>
              </CardContent>
            </Card>
            <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center"><BarChart className="mr-2"/>Métricas Clave</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{properties.length}</p>
                        <p className="text-sm text-muted-foreground">Propiedades Totales</p>
                    </div>
                     <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{activeContracts.length}</p>
                        <p className="text-sm text-muted-foreground">Contratos Activos</p>
                    </div>
                     <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{`$${currentMonthPaymentsReceived.toLocaleString('es-CL')}`}</p>
                        <p className="text-sm text-muted-foreground">Ingresos este Mes</p>
                    </div>
                     <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{overallTenantScore}</p>
                        <p className="text-sm text-muted-foreground">Rating Prom. Arrendatarios</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center"><PieChartIcon className="mr-2" />Estado de Propiedades</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              {propertiesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={propertiesData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {propertiesData.map((entry, index) => (<Cell key={`cell-p-${index}`} fill={PROPERTIES_COLORS[entry.name as keyof typeof PROPERTIES_COLORS]} />))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} prop.`, 'Propiedades']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="flex h-full items-center justify-center text-muted-foreground">No hay datos.</div>}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center"><PieChartIcon className="mr-2" />Estado de Contratos</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              {contractsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={contractsData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {contractsData.map((entry, index) => (<Cell key={`cell-c-${index}`} fill={CONTRACTS_COLORS[entry.name as keyof typeof CONTRACTS_COLORS]} />))}
                    </Pie>
                     <RechartsTooltip formatter={(value) => [`${value} cont.`, 'Contratos']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="flex h-full items-center justify-center text-muted-foreground">No hay datos.</div>}
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center"><PieChartIcon className="mr-2" />Estado de Incidentes</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              {incidentsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incidentsData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {incidentsData.map((entry, index) => (<Cell key={`cell-i-${index}`} fill={INCIDENTS_COLORS[entry.name as keyof typeof INCIDENTS_COLORS]} />))}
                    </Pie>
                     <RechartsTooltip formatter={(value) => [`${value} inc.`, 'Incidentes']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="flex h-full items-center justify-center text-muted-foreground">No hay datos.</div>}
            </CardContent>
          </Card>
        </div>
        
        <AnnouncementsSection />
        
        <BulkUploadModal isOpen={isBulkUploadModalOpen} onClose={() => setIsBulkUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
      </div>
    </TooltipProvider>
  );
}
