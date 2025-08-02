'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { PaymentCard } from '@/components/payments/payment-card';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import type { Payment, Contract, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA ---
const mockContracts: Contract[] = [
  {
    id: 'CTR-001',
    propertyId: '1',
    propertyAddress: 'Av. Providencia 123',
    propertyName: 'Depto. en Providencia',
    landlordName: 'Carlos Arrendador',
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
    id: 'CTR-002',
    propertyId: '2',
    propertyAddress: 'Calle Falsa 123',
    propertyName: 'Casa en Las Condes',
    landlordName: 'Carlos Arrendador',
    tenantName: 'Ana García',
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2025-02-28T00:00:00Z',
    rentAmount: 1200000,
    status: 'Finalizado',
    propertyUsage: 'Habitacional',
    tenantEmail: 'ana.garcia@email.com',
    tenantRut: '22.222.222-2',
  },
   {
    id: 'CTR-003',
    propertyId: '3',
    propertyName: 'Oficina Central',
    landlordName: 'Laura Propietaria',
    propertyAddress: 'Apoquindo 5000',
    tenantName: 'Startup Innovadora SpA',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2025-12-31T00:00:00Z',
    rentAmount: 800000,
    status: 'Activo',
    propertyUsage: 'Comercial',
    tenantEmail: 'contacto@startup.com',
    tenantRut: '76.123.456-7',
  },
];

const initialPayments: Payment[] = [
  {
    id: 'PAY-001',
    contractId: 'CTR-001',
    propertyName: 'Depto. en Providencia',
    landlordName: 'Carlos Arrendador',
    tenantName: 'Juan Pérez',
    type: 'arriendo',
    amount: 500000,
    paymentDate: '2024-07-05T00:00:00Z',
    declaredAt: '2024-07-05T10:00:00Z',
    acceptedAt: '2024-07-05T14:00:00Z',
    status: 'aceptado',
    isOverdue: false,
    notes: 'Pago de arriendo de Julio.',
    attachmentUrl: '#',
  },
  {
    id: 'PAY-002',
    contractId: 'CTR-001',
    propertyName: 'Depto. en Providencia',
    landlordName: 'Carlos Arrendador',
    tenantName: 'Juan Pérez',
    type: 'arriendo',
    amount: 500000,
    paymentDate: '2024-08-04T00:00:00Z',
    declaredAt: '2024-08-04T11:30:00Z',
    status: 'pendiente',
    isOverdue: false,
    notes: 'Pago de arriendo de Agosto.',
    attachmentUrl: '#',
  },
  {
    id: 'PAY-003',
    contractId: 'CTR-003',
    propertyName: 'Oficina Central',
    landlordName: 'Laura Propietaria',
    tenantName: 'Startup Innovadora SpA',
    type: 'arriendo',
    amount: 800000,
    paymentDate: '2024-07-01T00:00:00Z',
    declaredAt: '2024-07-01T09:00:00Z',
    status: 'aceptado',
    isOverdue: true,
  },
];

export default function PaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // NOTE: For now, we assume a landlord role. This will be replaced by a real auth system.
  const currentUserRole: UserRole = 'Arrendador';

  const handleSavePayment = async (data: any) => {
    setProcessingId('new-payment');
    const contract = mockContracts.find(c => c.id === data.contractId);
    if (!contract) {
      toast({ title: 'Error', description: 'Contrato no encontrado', variant: 'destructive' });
      setProcessingId(null);
      return;
    }

    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    
    const newPayment: Payment = {
      ...data,
      id: uuidv4(),
      propertyName: contract.propertyName,
      landlordName: contract.landlordName,
      tenantName: contract.tenantName,
      declaredAt: new Date().toISOString(),
      status: 'pendiente',
    };
    setPayments(prev => [newPayment, ...prev]);
    toast({ title: 'Pago Declarado', description: 'El pago ha sido registrado y está pendiente de aceptación.' });
    setIsFormOpen(false);
    setProcessingId(null);
  };

  const handleAcceptPayment = async (paymentId: string) => {
    setProcessingId(paymentId);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId ? { ...p, status: 'aceptado', acceptedAt: new Date().toISOString() } : p
      )
    );
    toast({ title: 'Pago Aceptado', description: 'El pago ha sido marcado como aceptado.', variant: 'default' });
    setProcessingId(null);
  };

  const filteredPayments = useMemo(() => {
    // This is a placeholder for real filtering logic based on logged-in user
    if (currentUserRole === 'Arrendador') {
      return payments; // Landlord sees all payments
    }
    // Tenant sees their own payments (mocked)
    return payments.filter(p => p.tenantName === 'Juan Pérez' || p.tenantName === 'Startup Innovadora SpA');
  }, [payments, currentUserRole]);

  const activeTenantContracts = useMemo(() => {
     return mockContracts.filter(c => c.status === 'Activo');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h1>
          <p className="text-muted-foreground">
            {currentUserRole === 'Arrendador'
              ? 'Revise y acepte los pagos declarados por sus arrendatarios.'
              : 'Declare los pagos de su arriendo de forma rápida y sencilla.'}
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          {currentUserRole === 'Arrendatario' && (
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Declarar Pago
            </Button>
          )}
        </div>
      </div>
      
      {filteredPayments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPayments.map(payment => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              currentUserRole={currentUserRole}
              onAccept={handleAcceptPayment}
              isProcessing={processingId === payment.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No hay pagos para mostrar</h3>
            <p className="text-muted-foreground mt-1">
                {currentUserRole === 'Arrendatario' ? 'Declare su primer pago para comenzar.' : 'Aún no se han declarado pagos.'}
            </p>
        </div>
      )}

      <PaymentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSavePayment}
        tenantContracts={activeTenantContracts}
      />
    </div>
  );
}
