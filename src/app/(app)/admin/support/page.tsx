
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import type { SupportTicket, UserProfile, Property, Contract } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, AlertCircle, CheckCircle, Users, Building, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, differenceInCalendarDays, addMonths, startOfDay } from 'date-fns';

function SupportTickets() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [processingTicketId, setProcessingTicketId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (currentUser?.role !== 'Administrador') return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'tickets'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const allTickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as SupportTicket));
      setTickets(allTickets);
    } catch (error) {
      console.error("Error fetching tickets: ", error);
      toast({ title: 'Error', description: 'No se pudieron cargar los tickets.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResponse = async (ticketId: string) => {
    if (!currentUser || !response.trim()) return;

    setProcessingTicketId(ticketId);
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        response: response,
        status: 'respondido',
        respondedAt: serverTimestamp(),
        respondedBy: currentUser.name,
      });
      setResponse('');
      toast({ title: 'Respuesta Enviada', description: 'El ticket ha sido actualizado.' });
      fetchTickets(); // Refresh
    } catch (error) {
      console.error("Error sending response: ", error);
      toast({ title: 'Error', description: 'No se pudo enviar la respuesta.', variant: 'destructive' });
    } finally {
      setProcessingTicketId(null);
    }
  };

  const getStatusBadgeVariant = (status: SupportTicket['status']) => {
    switch (status) {
      case 'abierto': return 'bg-yellow-100 text-yellow-800';
      case 'respondido': return 'bg-green-100 text-green-800';
      case 'cerrado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bandeja de Entrada de Tickets</CardTitle>
        <CardDescription>Revisa y responde a los tickets de los usuarios.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : tickets.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {tickets.map(ticket => (
              <AccordionItem key={ticket.id} value={ticket.id} className="border rounded-lg px-4">
                <AccordionTrigger>
                  <div className="flex justify-between w-full items-center pr-4">
                    <div className="text-left">
                      <p className="font-semibold">{ticket.userName} <span className="font-normal text-sm text-muted-foreground">({ticket.userEmail})</span></p>
                      <p className="text-xs text-muted-foreground">{new Date(ticket.timestamp).toLocaleString('es-CL')}</p>
                    </div>
                    <Badge className={`${getStatusBadgeVariant(ticket.status)} capitalize`}>{ticket.status}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <p className="text-base p-4 bg-muted/50 rounded-md whitespace-pre-wrap">{ticket.message}</p>
                    {ticket.response && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Tu Respuesta</AlertTitle>
                        <AlertDescription>
                          <p className="font-semibold text-xs text-muted-foreground mb-1">Respondido el {ticket.respondedAt ? new Date((ticket.respondedAt as any).toDate()).toLocaleString('es-CL') : 'N/A'}</p>
                          {ticket.response}
                        </AlertDescription>
                      </Alert>
                    )}
                    {ticket.status === 'abierto' && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Escribe tu respuesta..."
                          rows={4}
                          onChange={(e) => setResponse(e.target.value)}
                          defaultValue=""
                        />
                        <Button onClick={() => handleResponse(ticket.id)} disabled={processingTicketId === ticket.id}>
                          {processingTicketId === ticket.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Enviar Respuesta
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-muted-foreground py-8">No hay tickets de soporte.</p>
        )}
      </CardContent>
    </Card>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), where('role', '!=', 'Administrador'));
      const propertiesQuery = query(collection(db, 'properties'));
      const contractsQuery = query(collection(db, 'contracts'));
      
      const [usersSnapshot, propertiesSnapshot, contractsSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(propertiesQuery),
        getDocs(contractsQuery),
      ]);

      setUsers(usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
      setProperties(propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Property)));
      setContracts(contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract)));

    } catch (error) {
      console.error("Error fetching user management data:", error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos de gestión de usuarios.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const getTrialDaysLeft = (trialEndsAt?: string) => {
    if (!trialEndsAt) return { text: 'N/A', variant: 'secondary' as const };
    const daysLeft = differenceInDays(parseISO(trialEndsAt), new Date());
    if (daysLeft < 0) return { text: 'Expirado', variant: 'destructive' as const };
    if (daysLeft <= 7) return { text: `${daysLeft} días`, variant: 'destructive' as const };
    return { text: `${daysLeft} días`, variant: 'default' as const };
  };
  
  const calculateServiceCost = (user: UserProfile, userProperties: Property[]) => {
    if (user.role !== 'Arrendador' || userProperties.length === 0) {
      return 'N/A';
    }

    const today = startOfDay(new Date());
    const costPerProperty = 2500;
    const baseMonthlyCost = userProperties.length * costPerProperty;

    // Default to a 30-day cycle for simplicity if no specific end date is available
    let daysInCycle = 30;
    let daysRemaining = daysInCycle;

    if (user.trialEndsAt) {
      const trialEndDate = startOfDay(parseISO(user.trialEndsAt));
      if (trialEndDate < today) {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(baseMonthlyCost);
      }
      
      const nextMonthFromToday = addMonths(today, 1);
      const cycleStart = startOfMonth(today);
      const cycleEnd = endOfMonth(today);
      
      daysInCycle = differenceInCalendarDays(cycleEnd, cycleStart) + 1;
      
      if (trialEndDate <= cycleEnd) {
        // Trial ends within the current calendar month cycle
        const activeDays = differenceInCalendarDays(trialEndDate, today) + 1;
        if (activeDays <= 0) return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(0);
        const dailyRate = baseMonthlyCost / daysInCycle;
        const proratedCost = dailyRate * activeDays;
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Math.round(proratedCost));
      }
    }
    
    // Default full monthly cost if not in a special prorated case
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(baseMonthlyCost);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>Supervisa a los usuarios registrados, sus propiedades y contratos.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {users.map(user => {
              const userProperties = user.role === 'Arrendador' ? properties.filter(p => p.ownerUid === user.uid) : [];
              const userContracts = contracts.filter(c => c.landlordId === user.uid || c.tenantId === user.uid);
              const trialInfo = getTrialDaysLeft(user.trialEndsAt);
              const serviceCost = calculateServiceCost(user, userProperties);

              return (
                <AccordionItem key={user.uid} value={user.uid} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-2 hover:no-underline">
                     <Table className="w-full">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableCell className="p-0 font-semibold w-1/4">{user.name}</TableCell>
                          <TableCell className="p-0 text-muted-foreground w-1/4">{user.email}</TableCell>
                          <TableCell className="p-0 w-[10%] text-center"><Badge variant={user.role === 'Arrendador' ? 'outline' : 'secondary'}>{user.role}</Badge></TableCell>
                          <TableCell className="p-0 w-[10%] text-center">{userProperties.length}</TableCell>
                           <TableCell className="p-0 w-[15%] text-center font-medium">{serviceCost}</TableCell>
                          <TableCell className="p-0 w-[15%] text-right"><Badge variant={trialInfo.variant}>{trialInfo.text}</Badge></TableCell>
                        </TableRow>
                     </Table>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2">
                      <div className="p-4 bg-muted/50 rounded-md">
                        {user.role === 'Arrendador' && (
                           <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-2 flex items-center"><Building className="h-4 w-4 mr-2"/>Propiedades ({userProperties.length})</h4>
                               {userProperties.length > 0 ? (
                                <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                                  {userProperties.map(p => <li key={p.id}>{p.address}, {p.comuna} <Badge variant="outline" className="ml-2">{p.status}</Badge></li>)}
                                </ul>
                               ) : <p className="text-xs text-muted-foreground">Este usuario no tiene propiedades.</p>}
                           </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center"><FileText className="h-4 w-4 mr-2"/>Contratos ({userContracts.length})</h4>
                             {userContracts.length > 0 ? (
                                <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                                  {userContracts.map(c => <li key={c.id}>Contrato en {c.propertyAddress} con {c.landlordId === user.uid ? c.tenantName : c.landlordName} <Badge variant="outline" className="ml-2">{c.status}</Badge></li>)}
                                </ul>
                               ) : <p className="text-xs text-muted-foreground">Este usuario no tiene contratos.</p>}
                        </div>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}


export default function AdminSupportPage() {
  const { currentUser } = useAuth();
  
  if (currentUser?.role !== 'Administrador') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acceso Denegado</AlertTitle>
        <AlertDescription>Esta sección solo está disponible para administradores.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
      
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="tickets">Tickets de Soporte</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <UserManagement />
        </TabsContent>
        <TabsContent value="tickets" className="mt-4">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
}
