"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paperclip, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Payment, UserRole } from "@/types";

interface PaymentCardProps {
  payment: Payment;
  currentUserRole: UserRole | null;
  onAccept: () => void;
  isProcessing: boolean; 
}

export function PaymentCard({
  payment,
  currentUserRole,
  onAccept,
  isProcessing,
}: PaymentCardProps) {
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    // Use UTC to avoid timezone issues during rendering
    const date = new Date(dateString);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadgeVariant = (status: Payment["status"]) => {
    switch (status) {
      case "pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "aceptado": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="truncate pr-2">{payment.propertyName} - {payment.type}</span>
          <Badge className={`${getStatusBadgeVariant(payment.status)} capitalize text-xs font-semibold`}>
            {payment.status}
          </Badge>
        </CardTitle>
        <CardDescription className="text-2xl font-semibold text-primary">
          ${payment.amount.toLocaleString('es-CL')}
        </CardDescription>
        <div className="text-sm text-muted-foreground">
          Fecha de Pago: {formatDate(payment.paymentDate)}
          {payment.isOverdue && (
            <Badge variant="destructive" className="ml-2 text-xs p-1">
              <AlertCircle className="h-3 w-3 mr-1" />Atrasado
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {currentUserRole === "Arrendador" ? `Arrendatario: ${payment.tenantName || 'N/A'}` : `Arrendador: ${payment.landlordName || 'N/A'}`}
        </p>
      </CardHeader>
      <CardContent className="flex-grow pt-2">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm py-2">Ver más detalles</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm pt-2">
                <div>
                  <strong className="block font-medium">Notas:</strong>
                  <p className="text-muted-foreground">{payment.notes || 'No hay notas.'}</p>
                </div>
                <div>
                  <strong className="block font-medium">Declarado:</strong>
                  <p className="text-muted-foreground">{formatDateTime(payment.declaredAt)}</p>
                </div>
                <div>
                  <strong className="block font-medium">Aceptado:</strong>
                  <p className="text-muted-foreground">{payment.status === 'aceptado' ? formatDateTime(payment.acceptedAt) : 'N/A'}</p>
                </div>
                {payment.attachmentUrl && (
                  <div>
                    <strong className="block font-medium">Comprobante:</strong>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto text-primary hover:underline">
                      <a href={payment.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <Paperclip className="h-4 w-4 mr-1" /> Ver Adjunto
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      {currentUserRole === "Arrendador" && payment.status === "pendiente" && (
        <div className="p-4 pt-0">
          <Button
            className="w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
            variant="outline"
            onClick={onAccept}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            {isProcessing ? "Aceptando..." : "Aceptar Pago"}
          </Button>
        </div>
      )}
    </Card>
  );
}
