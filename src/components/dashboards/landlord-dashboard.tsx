"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2, FileText, PlusCircle, Gavel, Upload, Calendar, Wallet, AlertTriangle,
  Timer, CheckCircle, XCircle, BarChart, Users, Megaphone, ClipboardCheck, DollarSign, PieChart as PieChartIcon
} from "lucide-react";
import type { Property, Contract, Payment, Incident, Evaluation, UserProfile } from "@/types";
import { AnnouncementsSection } from "./announcements-section";
import { BulkUploadModal } from "@/components/properties/bulk-upload-modal";
import { Skeleton } from "@/components/ui/skeleton";
import moment from 'moment';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// --- MOCK DATA ---
const mockUser: UserProfile = { uid: 'user_landlord_123', role: 'Arrendador', name: 'Carlos Arrendador', email: 'carlos@sara.com' };

const mockProperties: Property[] = [
  { id: '1', code: 'PRO-001', address: 'Av. Providencia 123', comuna: 'Providencia', region: 'Metropolitana de Santiago', status: 'Arrendada', type: 'Departamento', description: 'desc' },
  { id: '2', code: 'PRO-002', address: 'Calle Falsa 123', comuna: 'Las Condes', region: 'Metropolitana de Santiago', status: 'Arrendada', type: 'Casa', description: 'desc' },
  { id: '3', code: 'PRO-003', address: 'El Roble 456', comuna: 'Ñuñoa', region: 'Metropolitana de Santiago', status: 'Disponible', type: 'Departamento', description: 'desc' },
  { id: '4', code: 'PRO-004', address: 'Los Cerezos 789', comuna: 'Providencia', region: 'Metropolitana de Santiago', status: 'Mantenimiento', type: 'Departamento', description: 'desc' },
];

const mockContracts: Contract[] = [
  { id: 'CTR-001', propertyId: '1', propertyName: 'Depto. Providencia', tenantName: 'Juan Pérez', startDate: '2023-08-15T00:00:00Z', endDate: '2024-08-14T00:00:00Z', rentAmount: 500000, status: 'Activo', propertyAddress: '', landlordName: '', tenantEmail: '', tenantRut: '', propertyUsage: 'Habitacional' },
  { id: 'CTR-002', propertyId: '2', propertyName: 'Casa Las Condes', tenantName: 'Ana García', startDate: '2024-01-01T00:00:00Z', endDate: '2024-02-28T00:00:00Z', rentAmount: 1200000, status: 'Finalizado', propertyAddress: '', landlordName: '', tenantEmail: '', tenantRut: '', propertyUsage: 'Habitacional' },
  { id: 'CTR-003', propertyId: '3', propertyName: 'Depto. Ñuñoa', tenantName: 'Pedro Soto', startDate: '2024-09-01T00:00:00Z', endDate: '2025-08-31T00:00:00Z', rentAmount: 750000, status: 'Activo', propertyAddress: '', landlordName: '', tenantEmail: '', tenantRut: '', propertyUsage: 'Habitacional' },
  { id: 'CTR-004', propertyId: '4', propertyName: 'Depto. Los Cerezos', tenantName: 'Maria Rojas', startDate: '2024-07-01T00:00:00Z', endDate: '2025-06-30T00:00:00Z', rentAmount: 600000, status: 'Borrador', propertyAddress: '', landlordName: '', tenantEmail: '', tenantRut: '', propertyUsage: 'Habitacional' },
];

const mockPayments: Payment[] = [
    { id: 'PAY-001', contractId: 'CTR-001', amount: 500000, paymentDate: moment().subtract(1, 'month').toISOString(), status: 'aceptado', propertyName: 'Depto. Providencia', declaredAt: '', type: 'arriendo' },
    { id: 'PAY-002', contractId: 'CTR-003', amount: 750000, paymentDate: moment().toISOString(), status: 'aceptado', propertyName: 'Depto. Ñuñoa', declaredAt: '', type: 'arriendo' },
    { id: 'PAY-003', contractId: 'CTR-001', amount: 500000, paymentDate: moment().toISOString(), status: 'pendiente', propertyName: 'Depto. Providencia', declaredAt: '', type: 'arriendo' },
];


const mockIncidents: Incident[] = [
  { id: 'INC-001', contractId: 'CTR-001', propertyName: 'Depto. Providencia', type: 'reparaciones necesarias', status: 'pendiente', createdAt: '2024-07-20T10:00:00Z', landlordId: 'user_landlord_123', propertyId: '1', tenantId: 'user_tenant_456', description: 'desc', createdBy: 'user_tenant_456' },
  { id: 'INC-002', contractId: 'CTR-003', propertyName: 'Depto. Ñuñoa', type: 'pago', status: 'respondido', createdAt: '2024-07-18T15:30:00Z', landlordId: 'user_landlord_123', propertyId: '3', tenantId: 'user_tenant_789', description: 'desc', createdBy: 'user_landlord_123' },
  { id: 'INC-003', contractId: 'CTR-003', propertyName: 'Depto. Ñuñoa', type: 'ruidos molestos', status: 'cerrado', createdAt: '2024-06-18T15:30:00Z', landlordId: 'user_landlord_123', propertyId: '3', tenantId: 'user_tenant_789', description: 'desc', createdBy: 'user_tenant_789' },
];


const mockEvaluations: Evaluation[] = [
  { id: 'EVAL-001', contractId: 'CTR-002', propertyName: 'Casa Las Condes', status: 'recibida', criteria: { paymentPunctuality: 5, propertyCare: 4, communication: 5, generalBehavior: 5 }, evaluationDate: '2024-03-05T00:00:00Z', landlordId: 'user_landlord_123', landlordName: '', propertyId: '2', tenantId: '', tenantName: '' },
];


export function LandlordDashboard() {
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProperties(mockProperties);
    setContracts(mockContracts);
    setPayments(mockPayments);
    setIncidents(mockIncidents);
    setEvaluations(mockEvaluations);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadSuccess = () => {
    fetchData(); 
  };

  const totalProperties = properties.length;
  const activeContractsCount = contracts.filter(c => c.status === "Activo").length;
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
  const PROPERTIES_COLORS = { "Disponible": "#22c55e", "Arrendada": "#3b82f6", "Mantenimiento": "#f97316" };

  const contractsData = Object.entries(
    contracts.reduce((acc, contract) => {
       const status = contract.status || "Desconocido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  const CONTRACTS_COLORS = { "Activo": "#22c55e", "Borrador": "#f97316", "Finalizado": "#6b7280", "Cancelado": "#ef4444" };

  const incidentsData = Object.entries(
    incidents.reduce((acc, incident) => {
       const status = incident.status || "Desconocido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  const INCIDENTS_COLORS = { "pendiente": "#f97316", "respondido": "#3b82f6", "cerrado": "#6b7280" };


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
                    {pendingContractsCount > 0 && <li><Link href="/contracts" className="underline">Tienes {pendingContractsCount} contrato(s) en borrador.</Link></li>}
                    {pendingPaymentsCount > 0 && <li><Link href="/payments" className="underline">Hay {pendingPaymentsCount} pago(s) pendiente(s) de aprobación.</Link></li>}
                    {openIncidentsCount > 0 && <li><Link href="/incidents" className="underline">Hay {openIncidentsCount} incidente(s) abierto(s) que requieren tu atención.</Link></li>}
                    {expiringContractsCount > 0 && <li><Link href="/contracts" className="underline">Tienes {expiringContractsCount} contrato(s) próximos a vencer.</Link></li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

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

        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center"><BarChart className="mr-2"/>Métricas Clave</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{totalProperties}</p>
                        <p className="text-sm text-muted-foreground">Propiedades Totales</p>
                    </div>
                     <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{activeContractsCount}</p>
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

            <Card className="shadow-lg">
              <CardHeader><CardTitle className="flex items-center"><PlusCircle className="mr-2"/>Acciones Rápidas</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                  <Button asChild size="lg" className="h-auto py-3"><Link href="/properties"><Building2 className="mr-2" /><span>Gestionar Propiedades</span></Link></Button>
                  <Button asChild size="lg" className="h-auto py-3"><Link href="/contracts"><FileText className="mr-2" /><span>Ver Contratos</span></Link></Button>
                  <Button asChild size="lg" className="h-auto py-3"><Link href="/payments"><Wallet className="mr-2" /><span>Revisar Pagos</span></Link></Button>
                  <Button asChild size="lg" className="h-auto py-3"><Link href="/evaluations"><ClipboardCheck className="mr-2" /><span>Evaluar Arrendatario</span></Link></Button>
                  <Button asChild size="lg" className="h-auto py-3"><Link href="/calendar"><Calendar className="mr-2" /><span>Calendario</span></Link></Button>
                  <Button onClick={() => setIsBulkUploadModalOpen(true)} size="lg" className="h-auto py-3"><Upload className="mr-2" /><span>Carga Masiva</span></Button>
              </CardContent>
            </Card>
        </div>
        
        <AnnouncementsSection />
        
        <BulkUploadModal isOpen={isBulkUploadModalOpen} onClose={() => setIsBulkUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
      </div>
    </TooltipProvider>
  );
}
