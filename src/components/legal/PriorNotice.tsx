"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Contract, Payment, Incident, UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCopy, Loader2 } from "lucide-react";

interface PriorNoticeProps {
  contract: Contract;
}

interface FetchedData {
  pendingPaymentDetails: string;
  relevantIncidentDetails: string;
  totalAmountDue: number;
  hasPendingPayments: boolean;
  hasRelevantIncidents: boolean;
}

// MOCK DATA
const mockPayments: Payment[] = [
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
];

const mockIncidents: Incident[] = [
     {
        id: 'INC-001',
        contractId: 'CTR-001',
        propertyId: '1',
        propertyName: 'Depto. en Providencia',
        landlordId: 'user_landlord_123',
        landlordName: 'Carlos Arrendador',
        tenantId: 'user_tenant_456',
        tenantName: 'Juan Pérez',
        type: 'reparaciones necesarias',
        description: 'La llave del lavamanos del baño principal está goteando constantemente. Necesita ser reparada.',
        status: 'pendiente',
        createdAt: '2024-07-20T10:00:00Z',
        createdBy: 'user_tenant_456',
    },
];
const mockCurrentUser: UserProfile = { uid: 'user_landlord_123', role: 'Arrendador', name: 'Carlos Arrendador', email: 'carlos.arrendador@sara.com' };

export function PriorNotice({ contract }: PriorNoticeProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [noticeText, setNoticeText] = useState("");
  const [fetchedData, setFetchedData] = useState<FetchedData | null>(null);

  const today = new Date().toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const cityPlaceholder = contract.propertyAddress?.split(',').pop()?.trim() || "[Ciudad]";

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const fetchContractData = useCallback(async () => {
    setIsLoading(true);

    // Simulate API Fetch
    await new Promise(resolve => setTimeout(resolve, 1000));

    let pendingPaymentDetails = "";
    let relevantIncidentDetails = "";
    let totalAmountDue = 0;
    let hasPendingPayments = false;
    let hasRelevantIncidents = false;

    const pendingPayments = mockPayments.filter(p => p.contractId === contract.id && p.status === 'pendiente');

    if (pendingPayments.length > 0) {
      hasPendingPayments = true;
      pendingPaymentDetails += "Deuda Pendiente de Pago:\n";
      pendingPayments.forEach(p => {
        pendingPaymentDetails += `- Tipo: ${p.type}, Monto: $${p.amount.toLocaleString('es-CL')}, Fecha de Pago: ${formatDate(p.paymentDate)}\n`;
        totalAmountDue += p.amount;
      });
      pendingPaymentDetails += `TOTAL ADEUDADO: $${totalAmountDue.toLocaleString('es-CL')}\n\n`;
    } else {
      pendingPaymentDetails = "No se encontraron pagos pendientes declarados.\n\n";
    }

    const relevantIncidentTypes: Incident["type"][] = ["cuidado de la propiedad", "reparaciones necesarias", "incumplimiento de contrato"];
    const relevantIncidents = mockIncidents.filter(i => i.contractId === contract.id && relevantIncidentTypes.includes(i.type));

    if (relevantIncidents.length > 0) {
      hasRelevantIncidents = true;
      relevantIncidentDetails += "Otros Incumplimientos Contractuales Observados:\n";
      relevantIncidents.forEach(i => {
        relevantIncidentDetails += `- Tipo: ${i.type}, Fecha: ${formatDate(i.createdAt)}, Descripción: ${i.description.substring(0, 100)}...\n`;
      });
      relevantIncidentDetails += "\n";
    } else {
      relevantIncidentDetails = "No se encontraron incidentes relevantes registrados.\n\n";
    }
    
    setFetchedData({ pendingPaymentDetails, relevantIncidentDetails, totalAmountDue, hasPendingPayments, hasRelevantIncidents });
    setIsLoading(false);
  }, [contract]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  useEffect(() => {
    if (isLoading || !fetchedData) {
      setNoticeText("Cargando detalles del borrador...");
      return;
    }

    const { pendingPaymentDetails, relevantIncidentDetails, totalAmountDue, hasPendingPayments, hasRelevantIncidents } = fetchedData;

    let actionRequired = "";
    if (hasPendingPayments) {
      actionRequired += `Pagar la totalidad de los montos adeudados, ascendentes a $${totalAmountDue.toLocaleString('es-CL')}.`;
    }
    if (hasRelevantIncidents) {
      if (hasPendingPayments) actionRequired += "\nAdicionalmente, se requiere subsanar los siguientes incumplimientos:\n";
      else actionRequired += "Subsanar los siguientes incumplimientos:\n";
      actionRequired += "[Describa aquí las acciones específicas requeridas para los incidentes listados, ej: Reparar los daños X, cesar actividad Y, etc.]";
    }
    if (!hasPendingPayments && !hasRelevantIncidents) {
        actionRequired = "[ESPECIFICAR AQUÍ LA ACCIÓN REQUERIDA POR EL INCUMPLIMIENTO PRINCIPAL]";
    }

    const generatedText = `
${cityPlaceholder}, ${today}

SEÑOR(A)
${contract.tenantName?.toUpperCase() || "[NOMBRE DEL ARRENDATARIO]"}
${contract.propertyAddress || "[DIRECCIÓN DE LA PROPIEDAD ARRENDADA]"}
PRESENTE

De nuestra consideración:

Junto con saludar, y en mi calidad de arrendador(a) del inmueble ubicado en ${contract.propertyAddress || "[DIRECCIÓN DE LA PROPIEDAD ARRENDADA]"}, según contrato de arriendo de fecha ${new Date(contract.startDate).toLocaleDateString("es-CL")}, vengo en notificarle formalmente lo siguiente:

Con fecha de hoy, se constata un incumplimiento de las obligaciones contractuales por su parte. A continuación, se detallan los incumplimientos detectados:

${pendingPaymentDetails}${relevantIncidentDetails}Adicionalmente, sírvase detallar cualquier otro incumplimiento no listado:
[ESPECIFICAR AQUÍ CUALQUIER OTRO INCUMPLIMIENTO. EJ: No pago de la renta del mes XXXX, uso indebido de la propiedad, etc.]

En virtud de lo anterior, se le requiere para que en un plazo máximo e improrrogable de DIEZ (10) DÍAS HÁBILES, contados desde la recepción de la presente comunicación, proceda a:
${actionRequired}

En caso de no dar cumplimiento a lo requerido dentro del plazo señalado, se procederá a iniciar las acciones legales correspondientes para obtener la restitución del inmueble y el cobro de las sumas adeudadas.

Puede realizar el pago/contacto a través de [ESPECIFICAR MEDIO DE PAGO/CONTACTO: Ej: transferencia a la cuenta N° XXXXX del Banco YYYY, titular ZZZZ, RUT WWWW-W, correo electrónico ${mockCurrentUser?.email || '[SU CORREO ELECTRÓNICO]'}}.

Sin otro particular, le saluda atentamente,

____________________________________
${contract.landlordName?.toUpperCase() || "[NOMBRE DEL ARRENDADOR]"}
Arrendador(a)
RUT: [SU RUT]
Correo Electrónico: ${mockCurrentUser?.email || '[SU CORREO ELECTRÓNICO]'}
Teléfono: [SU TELÉFONO]
`;
    setNoticeText(generatedText.trim());

  }, [contract, isLoading, fetchedData, today, cityPlaceholder]);


  const handleCopyToClipboard = () => {
    if (isLoading || !noticeText || noticeText === "Cargando detalles del borrador...") {
        toast({ title: "Espere", description: "El borrador aún se está generando.", variant: "default" });
        return;
    }
    navigator.clipboard.writeText(noticeText)
      .then(() => {
        toast({ title: "Texto Copiado", description: "El borrador de la notificación ha sido copiado al portapapeles." });
      })
      .catch(err => {
        toast({ title: "Error al Copiar", description: "No se pudo copiar el texto.", variant: "destructive" });
        console.error('Error al copiar texto: ', err);
      });
  };

  return (
    <div className="p-4 border rounded-md bg-background shadow print:shadow-none print:border-none mt-4">
      <header className="mb-4">
        <h3 className="text-md font-semibold text-primary/90">Borrador Dinámico: Notificación Previa por Incumplimiento</h3>
        <p className="text-sm text-muted-foreground">
          Este borrador recopila información de pagos e incidentes registrados.
          <strong>Es crucial que lo revise, complete los campos `[ENTRE CORCHETES]` y lo adapte a su situación antes de enviarlo.</strong>
        </p>
      </header>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Generando borrador con datos del contrato...</p>
        </div>
      ) : (
        <Textarea
          readOnly
          value={noticeText}
          className="w-full h-[500px] text-xs font-mono bg-muted/30 whitespace-pre-wrap"
          aria-label="Borrador de notificación previa al arrendatario"
        />
      )}
      <div className="mt-4 flex justify-end">
        <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={isLoading}>
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copiar Texto
        </Button>
      </div>

      <footer className="mt-6 pt-4 border-t text-center print:mt-8 print:pt-4">
        <p className="text-xs text-muted-foreground">
          Este borrador es una herramienta de apoyo proporcionada por S.A.R.A. y no constituye asesoría legal.
          Consulte con un abogado para su caso particular.
        </p>
      </footer>
    </div>
  );
}
