
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, LayoutGrid, List, FileDown } from 'lucide-react';
import { PaymentCard } from '@/components/payments/payment-card';
import { PaymentFormDialog, type PaymentFormValues } from '@/components/payments/payment-form-dialog';
import type { Payment, Contract, UserRole, UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PaymentsDataTable } from '@/components/payments/payments-data-table';
import { columns as createColumns } from '@/components/payments/payments-columns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Papa from 'papaparse';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Skeleton } from '@/components/ui/skeleton';
import { sendEmail } from '@/lib/notifications';

export default function PaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [paymentToProcess, setPaymentToProcess] = useState<Payment | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userField = currentUser.role === 'Arrendador' ? 'landlordId' : 'tenantId';
      const contractsQuery = query(
        collection(db, 'contracts'), 
        where(userField, '==', currentUser.uid),
        where('managementType', '==', 'collaborative') // Only collaborative contracts
      );

      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));
      setContracts(contractsList);
      
      const contractIds = contractsList.map(c => c.id);
      if (contractIds.length > 0) {
        const paymentsQuery = query(collection(db, 'payments'), where('contractId', 'in', contractIds));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsList = paymentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Payment));
        setPayments(paymentsList);
      } else {
        setPayments([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleSavePayment = async (data: PaymentFormValues) => {
    if (!currentUser || currentUser.role !== 'Arrendatario') {
        toast({ title: 'Acción no permitida', description: 'Solo los arrendatarios pueden declarar pagos.', variant: 'destructive' });
        return;
    }
    setProcessingId('new-payment');
    
    const contract = contracts.find(c => c.id === data.contractId);
    if (!contract) {
      toast({ title: 'Error', description: 'Contrato no encontrado', variant: 'destructive' });
      setProcessingId(null);
      return;
    }
    
    const landlordDoc = await getDoc(doc(db, 'users', contract.landlordId!));
    const landlordEmail = landlordDoc.exists() ? landlordDoc.data().email : 'landlord-email-not-found@example.com';

    try {
        let attachmentUrl: string | null = null;
        if (data.attachment && data.attachment.length > 0) {
            const file = data.attachment[0];
            const storageRef = ref(storage, `payment-attachments/${currentUser.uid}/${Date.now()}-${file.name}`);
            toast({ title: "Subiendo archivo...", description: "Por favor espera." });
            const snapshot = await uploadBytes(storageRef, file);
            attachmentUrl = await getDownloadURL(snapshot.ref);
            toast({ title: "Archivo subido", description: "El comprobante se ha subido correctamente." });
        }

        const { attachment, ...restOfData } = data;

        const newPaymentData: Omit<Payment, 'id'> = {
          ...restOfData,
          attachmentUrl: attachmentUrl,
          propertyName: contract.propertyName,
          landlordId: contract.landlordId,
          landlordName: contract.landlordName,
          tenantId: currentUser.uid,
          tenantName: currentUser.name,
          declaredAt: new Date().toISOString(),
          status: 'pendiente',
        };

        const sanitizedPaymentData = Object.fromEntries(
            Object.entries(newPaymentData).map(([key, value]) => [key, value === undefined ? null : value])
        );

        await addDoc(collection(db, 'payments'), sanitizedPaymentData);

        // Send notification email to landlord only for collaborative contracts
        if (contract.managementType === 'collaborative') {
          await sendEmail({
              to: landlordEmail,
              subject: `Nuevo Pago Declarado por ${currentUser.name}`,
              html: `
                  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                          <h1 style="color: #2077c2; text-align: center;">Nuevo Pago Declarado</h1>
                          <p>Hola ${contract.landlordName},</p>
                          <p><strong>${currentUser.name}</strong> ha declarado un nuevo pago para la propiedad <strong>${contract.propertyName}</strong>.</p>
                          <ul>
                              <li><strong>Tipo:</strong> ${data.type}</li>
                              <li><strong>Monto:</strong> $${data.amount.toLocaleString('es-CL')}</li>
                              <li><strong>Fecha de Pago:</strong> ${new Date(data.paymentDate).toLocaleDateString('es-CL')}</li>
                          </ul>
                          <p>Por favor, inicia sesión en S.A.R.A para revisar y aceptar este pago.</p>
                          <div style="text-align: center; margin: 30px 0;">
                              <a href="http://www.sarachile.com/login" style="background-color: #2077c2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a S.A.R.A</a>
                          </div>
                      </div>
                  </div>
              `,
          });
          toast({ title: 'Pago Declarado', description: 'El pago ha sido registrado y el arrendador ha sido notificado.' });
        } else {
          toast({ title: 'Pago Declarado', description: 'El pago ha sido registrado para su gestión interna.' });
        }
        
        fetchData();
        setIsFormOpen(false);
    } catch(error) {
        console.error("Error saving payment:", error);
        toast({ title: 'Error', description: 'No se pudo declarar el pago.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };

  const openAcceptDialog = (payment: Payment) => {
    setPaymentToProcess(payment);
    setIsAcceptDialogOpen(true);
  };
  
  const confirmAcceptPayment = async () => {
    if (!paymentToProcess || !currentUser || currentUser.role !== 'Arrendador') return;
    setProcessingId(paymentToProcess.id);
    setIsAcceptDialogOpen(false);
    
    try {
        const contract = contracts.find(c => c.id === paymentToProcess.contractId);
        
        const paymentRef = doc(db, 'payments', paymentToProcess.id);
        await updateDoc(paymentRef, {
            status: 'aceptado',
            acceptedAt: new Date().toISOString(),
        });
        
        if (contract && contract.managementType === 'collaborative') {
            const tenantDoc = await getDoc(doc(db, 'users', paymentToProcess.tenantId!));
            const tenantEmail = tenantDoc.exists() ? tenantDoc.data().email : null;

            if (tenantEmail) {
                await sendEmail({
                    to: tenantEmail,
                    subject: `Tu Pago ha sido Aceptado`,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                                <h1 style="color: #28a745; text-align: center;">¡Pago Confirmado!</h1>
                                <p>Hola ${paymentToProcess.tenantName},</p>
                                <p>Tu pago para la propiedad <strong>${paymentToProcess.propertyName}</strong> ha sido aceptado por ${currentUser.name}.</p>
                                <ul>
                                    <li><strong>Tipo:</strong> ${paymentToProcess.type}</li>
                                    <li><strong>Monto:</strong> $${paymentToProcess.amount.toLocaleString('es-CL')}</li>
                                    <li><strong>Fecha de Pago:</strong> ${new Date(paymentToProcess.paymentDate).toLocaleDateString('es-CL')}</li>
                                </ul>
                                <p>Este correo sirve como confirmación de tu pago. Puedes ver todos tus pagos en tu panel de S.A.R.A.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="http://www.sarachile.com/login" style="background-color: #2077c2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a S.A.R.A</a>
                                </div>
                            </div>
                        </div>
                    `,
                });
            }
        }

        toast({ title: 'Pago Aceptado', description: 'El pago ha sido marcado como aceptado.', variant: 'default' });
        fetchData();
    } catch(error) {
        console.error("Error accepting payment:", error);
        toast({ title: 'Error', description: 'No se pudo aceptar el pago.', variant: 'destructive' });
    } finally {
        setProcessingId(null);
        setPaymentToProcess(null);
    }
  };

  const userContracts = useMemo(() => {
    if (!currentUser) return [];
    return contracts.filter(c => c.status === 'Activo');
  }, [contracts, currentUser]);

  const columns = createColumns({ onAccept: openAcceptDialog, currentUserRole: currentUser?.role || 'Arrendatario' });

  const handleExport = () => {
    const dataToExport = payments.map(p => ({
      ID_Pago: p.id,
      ID_Contrato: p.contractId,
      Propiedad: p.propertyName,
      Arrendatario: p.tenantName,
      Arrendador: p.landlordName,
      Tipo: p.type,
      Monto: p.amount,
      Fecha_Pago: p.paymentDate.split('T')[0],
      Fecha_Declaracion: p.declaredAt.split('T')[0],
      Fecha_Aceptacion: p.acceptedAt ? p.acceptedAt.split('T')[0] : '',
      Estado: p.status,
      Atrasado: p.isOverdue ? 'Sí' : 'No',
      Notas: p.notes,
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sara_pagos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportación exitosa', description: 'El archivo de pagos ha sido descargado.' });
  };
  
  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === 'Arrendador'
              ? 'Revise y acepte los pagos declarados por sus arrendatarios en contratos colaborativos.'
              : 'Declare los pagos de su arriendo en contratos colaborativos de forma rápida y sencilla.'}
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={() => setViewMode('cards')} disabled={viewMode === 'cards'}>
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Vista de Tarjetas</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode('list')} disabled={viewMode === 'list'}>
              <List className="h-4 w-4" />
              <span className="sr-only">Vista de Lista</span>
            </Button>
             <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
            </Button>
          {currentUser?.role === 'Arrendatario' && (
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Declarar Pago
            </Button>
          )}
        </div>
      </div>
      
      {payments.length > 0 ? (
        viewMode === 'cards' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {payments.map(payment => (
                <PaymentCard
                key={payment.id}
                payment={payment}
                currentUserRole={currentUser?.role || null}
                onAccept={() => openAcceptDialog(payment)}
                isProcessing={processingId === payment.id}
                />
            ))}
            </div>
        ) : (
            <PaymentsDataTable columns={columns} data={payments} />
        )
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No hay pagos para mostrar</h3>
            <p className="text-muted-foreground mt-1">
                Esta sección solo muestra pagos de contratos colaborativos.
            </p>
        </div>
      )}

      <PaymentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSavePayment}
        tenantContracts={userContracts}
      />
      
      <AlertDialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar aceptación de pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el pago como aceptado y no se puede deshacer. Se enviará una notificación al arrendatario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAcceptDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAcceptPayment} className="bg-green-600 hover:bg-green-700">
              Sí, aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
