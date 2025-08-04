
"use client";

import type { Contract, Property } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContractDisplayProps {
  contract: Contract;
  property: Property | null;
}

export function ContractDisplay({ contract, property }: ContractDisplayProps) {
  if (!property) {
    return (
      <Alert variant="default" className="border-dashed">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Esperando detalles de la propiedad</AlertTitle>
        <AlertDescription>
          Cargando información adicional del inmueble para completar el documento.
        </AlertDescription>
      </Alert>
    );
  }

  const formatDate = (dateInput: string | Date | undefined, options: Intl.DateTimeFormatOptions = {}): string => {
    if (!dateInput) return "No especificada";
    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
        if (isNaN(date.getTime())) return "Fecha Inválida";
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es, ...options });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "No especificado";
    return `$${amount.toLocaleString("es-CL")}`;
  };

  const cityAndCommune = `${property.comuna || '[Comuna no especificada]'}, ${property.region || '[Región no especificada]'}`;
  const fullAddress = `${property.address}, ${cityAndCommune}`;

  const getUsageClause = () => {
    switch (contract.propertyUsage) {
      case "Habitacional":
        return "El inmueble objeto de este contrato será destinado exclusivamente a la habitación del Arrendatario y su familia.";
      case "Comercial":
        return "El inmueble objeto de este contrato será destinado exclusivamente al giro comercial declarado por el Arrendatario.";
      default:
        return "El destino de la propiedad no ha sido especificado.";
    }
  };

  return (
    <div className="p-8 border rounded-md bg-white shadow-lg font-serif text-gray-800 text-justify mt-4 text-sm/relaxed">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Contrato de Arrendamiento</h1>
        <h2 className="text-lg font-semibold uppercase">{contract.propertyUsage === 'Habitacional' ? 'Para Fines Habitacionales' : 'Para Fines Comerciales'}</h2>
      </header>
      
      <p className="mb-6">
        En {cityAndCommune}, a {formatDate(new Date())}, entre las partes identificadas a continuación:
      </p>

      <div className="space-y-4 mb-6">
        <p><strong>EL ARRENDADOR:</strong> Sr(a). <strong>{contract.landlordName || "[Nombre de Arrendador no especificado]"}</strong>, RUT <strong>{property.ownerRut || "[RUT no especificado]"}</strong>, con domicilio para estos efectos en [Domicilio del Arrendador], en adelante "el Arrendador".</p>
        <p><strong>EL ARRENDATARIO:</strong> Sr(a). <strong>{contract.tenantName || "[Nombre de Arrendatario no especificado]"}</strong>, RUT <strong>{contract.tenantRut || "[RUT no especificado]"}</strong>, con domicilio para estos efectos en el inmueble arrendado, en adelante "el Arrendatario".</p>
      </div>

      <p className="mb-6">
        Se ha convenido en celebrar el siguiente contrato de arrendamiento, regido por las disposiciones de la Ley N° 18.101, sus modificaciones, y el Código Civil.
      </p>

      <Separator className="my-6" />

      <div className="space-y-4">
        <p><strong>PRIMERO: PROPIEDAD ARRENDADA.</strong></p>
        <p>
          El Arrendador da en arrendamiento al Arrendatario el inmueble ubicado en <strong>{fullAddress}</strong>, consistente en un(a) {property.type ? `${property.type.toLowerCase()}` : "vivienda"}. El Arrendatario declara conocer y aceptar el estado de conservación del inmueble.
        </p>

        <p><strong>SEGUNDO: DESTINO.</strong></p>
        <p>
          {getUsageClause()} Queda estrictamente prohibido al Arrendatario subarrendar, ceder o transferir a cualquier título el presente contrato o los derechos sobre el inmueble.
        </p>

        <p><strong>TERCERO: PLAZO.</strong></p>
        <p>
          El presente contrato rige desde el <strong>{formatDate(contract.startDate)}</strong> hasta el <strong>{formatDate(contract.endDate)}</strong>. A su vencimiento, se entenderá renovado tácita y sucesivamente por períodos iguales, salvo que alguna de las partes comunique a la otra su voluntad de no renovar, mediante carta certificada enviada con una antelación mínima de sesenta (60) días.
        </p>

        <p><strong>CUARTO: RENTA.</strong></p>
        <p>
          La renta mensual será la suma de <strong>{formatCurrency(contract.rentAmount)}</strong>. Se pagará por anticipado dentro de los primeros <strong>{contract.rentPaymentDay || 5}</strong> días de cada mes. El simple retardo en el pago constituirá al Arrendatario en mora, facultando al Arrendador para cobrar el interés máximo convencional y para iniciar las acciones de término de contrato.
        </p>

        <p><strong>QUINTO: GARANTÍA.</strong></p>
        <p>
          El Arrendatario entrega en este acto al Arrendador la suma de <strong>{formatCurrency(contract.securityDepositAmount)}</strong>, con el fin de garantizar la conservación del inmueble y su restitución en el mismo estado en que se entrega. Esta suma será devuelta dentro de los 60 días siguientes a la restitución del inmueble, con los descuentos que correspondan.
        </p>

        <p><strong>SEXTO: MANTENIMIENTO Y REPARACIONES.</strong></p>
        <p>
          Serán de cargo del Arrendatario las reparaciones locativas y de mantenimiento. Las reparaciones necesarias o estructurales serán de cargo del Arrendador, debiendo el Arrendatario dar aviso inmediato de cualquier desperfecto.
        </p>

        <p><strong>SÉPTIMO: RESTITUCIÓN.</strong></p>
        <p>
          El Arrendatario se obliga a restituir el inmueble al término del contrato en el mismo estado en que lo recibió, salvo el desgaste por uso legítimo. La entrega se acreditará con un acta firmada por ambas partes. La no restitución en la fecha pactada dará derecho al Arrendador a cobrar, a título de multa, una suma equivalente al 100% de la renta diaria por cada día de retardo.
        </p>

        {contract.specialClauses && (
          <>
            <p><strong>OCTAVO: CLÁUSULAS ADICIONALES.</strong></p>
            <div className="p-3 my-2 border rounded-md bg-gray-50 whitespace-pre-wrap">
              <p>{contract.specialClauses}</p>
            </div>
          </>
        )}

        <p><strong>NOVENO: DOMICILIO.</strong></p>
        <p>
          Para todos los efectos legales, las partes fijan su domicilio en la comuna de {property.comuna || '[Comuna]'}, sometiéndose a la jurisdicción de sus Tribunales de Justicia.
        </p>
      </div>

      <Separator className="my-8" />
      
      <p className="mb-12">
        En señal de conformidad, las partes firman el presente contrato en dos ejemplares de igual tenor y fecha.
      </p>
      
      <div className="grid grid-cols-2 gap-8 pt-16">
        <div className="text-center">
          <div className="border-t-2 border-gray-600 w-3/4 mx-auto pt-2">
            <p className="font-semibold">{contract.landlordName || "ARRENDADOR"}</p>
            <p>RUT: {property.ownerRut || "[RUT no especificado]"}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-gray-600 w-3/4 mx-auto pt-2">
            <p className="font-semibold">{contract.tenantName || "ARRENDATARIO"}</p>
            <p>RUT: {contract.tenantRut || "[RUT no especificado]"}</p>
          </div>
        </div>
      </div>

      <footer className="mt-16 pt-4 border-t text-center">
        <p className="text-xs text-gray-500">
          Documento generado por S.A.R.A. | ID del Contrato: {contract.id}
        </p>
      </footer>
    </div>
  );
}
