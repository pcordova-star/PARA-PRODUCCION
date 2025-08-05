
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
import type { Property } from "@/types";
import { Separator } from "@/components/ui/separator";

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
}

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

export function PropertyDetailsDialog({ open, onOpenChange, property }: PropertyDetailsDialogProps) {
  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Propiedad</DialogTitle>
          <DialogDescription>
            Información completa de {property.type} en {property.address}.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-6 space-y-6 py-4">
          
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Código" value={<span className="font-mono">{property.code}</span>} />
              <DetailItem label="Estado" value={<Badge className="capitalize">{property.status}</Badge>} />
              <DetailItem label="Tipo de Propiedad" value={property.type} />
              <DetailItem label="Dirección" value={property.address} />
              <DetailItem label="Comuna" value={property.comuna} />
              <DetailItem label="Región" value={property.region} />
              <DetailItem label="RUT Propietario" value={property.ownerRut} />
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Características</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Precio Arriendo (CLP)" value={formatCurrency(property.price)} />
              <DetailItem label="Área (m²)" value={property.area ? `${property.area} m²` : "No especificado"} />
              <DetailItem label="Dormitorios" value={property.bedrooms} />
              <DetailItem label="Baños" value={property.bathrooms} />
            </div>
          </section>
          
          <Separator />

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Descripción</h3>
            <p className="text-base text-gray-800 whitespace-pre-wrap">{property.description}</p>
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
