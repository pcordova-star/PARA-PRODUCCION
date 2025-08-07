
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { SupportTicket } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AdminSupportPage() {
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
    <div className="container mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Soporte</h1>
      
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
                                    {processingTicketId === ticket.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
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
    </div>
  );
}
