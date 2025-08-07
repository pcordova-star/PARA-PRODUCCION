
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, addDoc, serverTimestamp, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import type { SupportTicket } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function SupportPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Query without ordering to avoid composite index requirement
      const q = query(collection(db, 'tickets'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const userTickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as SupportTicket));
      
      // Sort tickets on the client-side
      userTickets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setTickets(userTickets);
    } catch (error) {
      console.error("Error fetching tickets: ", error);
      toast({ title: 'Error', description: 'No se pudieron cargar tus tickets.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tickets'), {
        userId: currentUser.uid,
        userName: currentUser.name,
        userEmail: currentUser.email,
        message: message,
        timestamp: serverTimestamp(),
        status: 'abierto',
      });
      setMessage('');
      toast({ title: 'Ticket Enviado', description: 'Tu mensaje ha sido enviado a soporte.' });
      fetchTickets(); // Refresh the list
    } catch (error) {
      console.error("Error sending ticket: ", error);
      toast({ title: 'Error', description: 'No se pudo enviar tu mensaje.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
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
    <div className="container mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Centro de Soporte</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Enviar un Nuevo Ticket</CardTitle>
          <CardDescription>¿Tienes alguna pregunta o problema? Envíanos un mensaje y te responderemos a la brevedad.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={5}
              disabled={isSubmitting}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Tickets</CardTitle>
          <CardDescription>Revisa el estado y las respuestas de tus tickets anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Enviado el {new Date(ticket.timestamp).toLocaleString('es-CL')}
                      </p>
                      <p className="mt-2 text-gray-800">{ticket.message}</p>
                    </div>
                    <Badge className={`${getStatusBadgeVariant(ticket.status)} capitalize`}>{ticket.status}</Badge>
                  </div>
                  {ticket.response && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                       <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Respuesta de Soporte</AlertTitle>
                          <AlertDescription>
                            <p className="font-semibold text-xs text-muted-foreground mb-1">Respondido el {ticket.respondedAt ? new Date(ticket.respondedAt).toLocaleString('es-CL') : 'N/A'}</p>
                            {ticket.response}
                          </AlertDescription>
                        </Alert>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No tienes tickets de soporte.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
