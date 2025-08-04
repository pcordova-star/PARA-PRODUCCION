
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Contract } from "@/types";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ContractDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}

const formatDate = (dateInput?: string | Date) => {
  if (!dateInput) return "No especificado";
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return format(date, "d 'de' LLLL 'de' yyyy", { locale: es });
  } catch (e) {
    return "Fecha inválida";
  }
};

const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "No especificado";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-semibold text-gray-500">{label}</p>
    <div className="text-base text-gray-800">{value ?? "No especificado"}</div>
  </div>
);

export function ContractDetailsDialog({ open, onOpenChange, contract }: ContractDetailsDialogProps) {
  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Contrato</DialogTitle>
          <DialogDescription>
            Información completa del contrato para la propiedad {contract.propertyName}.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-6 space-y-6 py-4">
          
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Propiedad" value={contract.propertyAddress} />
              <DetailItem label="Estado del Contrato" value={<Badge className="capitalize">{contract.status}</Badge>} />
              <DetailItem label="Inicio del Contrato" value={formatDate(contract.startDate)} />
              <DetailItem label="Fin del Contrato" value={formatDate(contract.endDate)} />
            </div>
          </section>

          <Separator />
          
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Partes Involucradas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Arrendador" value={contract.landlordName} />
              <DetailItem label="Arrendatario" value={contract.tenantName} />
              <DetailItem label="Email Arrendatario" value={contract.tenantEmail} />
              <DetailItem label="RUT Arrendatario" value={contract.tenantRut} />
            </div>
          </section>
          
          <Separator />

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Condiciones Financieras</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Monto del Arriendo" value={formatCurrency(contract.rentAmount)} />
              <DetailItem label="Día de Pago del Arriendo" value={contract.rentPaymentDay} />
              <DetailItem label="Monto de la Garantía" value={formatCurrency(contract.securityDepositAmount)} />
              <DetailItem label="Gastos Comunes" value={contract.commonExpensesIncluded} />
              <DetailItem label="Día de Pago G. Comunes" value={contract.commonExpensesPaymentDay} />
              <DetailItem label="Día de Pago Cuentas" value={contract.utilitiesPaymentDay} />
              <DetailItem label="Reajuste por IPC" value={contract.ipcAdjustment ? `Sí, ${contract.ipcAdjustmentFrequency}` : "No"} />
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Cláusulas y Condiciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Uso de la Propiedad" value={contract.propertyUsage} />
              <DetailItem label="Prohibición de Subarrendar" value={contract.prohibitionToSublet ? "Sí" : "No"} />
              <div className="md:col-span-2">
                <DetailItem label="Cláusulas Especiales" value={contract.specialClauses || "Sin cláusulas especiales."} />
              </div>
            </div>
          </section>
          
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
