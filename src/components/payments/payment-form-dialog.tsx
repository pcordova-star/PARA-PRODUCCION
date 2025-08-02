"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription as UiFormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, CreditCard, Loader2 } from "lucide-react"; 
// MOCK: In a real app, this would come from firebase config
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import type { Contract } from "@/types"; 

const paymentTypes = ["arriendo", "gastos comunes", "otro"] as const;

const paymentFormSchema = z.object({
  contractId: z.string().min(1, { message: "Debes seleccionar un contrato." }),
  type: z.enum(paymentTypes, { 
    required_error: "Debes seleccionar un tipo de pago.",
  }),
  amount: z.coerce.number().min(1, { message: "El monto debe ser al menos $1." }),
  paymentDate: z.string().min(1, { message: "Debes seleccionar la fecha del pago." }), 
  notes: z.string().max(500, { message: "Máximo 500 caracteres." }).optional().nullable(),
  attachment: z
    .custom<FileList>((val) => val instanceof FileList, "Se esperaba un archivo")
    .refine((files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024, `El tamaño máximo es 5MB.`)
    .optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PaymentFormValues & { attachmentUrl: string | null }) => Promise<void>;
  tenantContracts: Contract[];
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  onSave,
  tenantContracts,
}: PaymentFormDialogProps) {
  const { toast } = useToast();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        contractId: tenantContracts.find((c) => c.status === "Activo")?.id || "",
        type: "arriendo", 
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0], 
        notes: "",
        attachment: undefined, 
      });
      setSelectedFileName(null);
    }
  }, [open, tenantContracts, form]);

  async function onSubmit(values: PaymentFormValues) {
    setIsUploading(true);
    let attachmentUrl: string | null = null;
    
    // MOCK UPLOAD
    if (values.attachment && values.attachment.length > 0) {
      const file = values.attachment[0];
      toast({ title: "Subiendo archivo...", description: `Simulando subida de ${file.name}.` });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload delay
      attachmentUrl = `https://mockstorage.com/receipts/${Date.now()}_${file.name}`;
      toast({ title: "Archivo Adjunto", description: "Comprobante subido exitosamente (simulado)." });
    }

    await onSave({ 
      ...values, 
      attachmentUrl: attachmentUrl 
    });

    setIsUploading(false);
  }

  const formatCurrencyInput = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('es-CL').format(num);
  };
  
  const parseCurrencyInput = (value: string): number => {
    const cleanValue = value.replace(/\./g, ''); 
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  };

  const isSubmitting = form.formState.isSubmitting || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" /> Declarar Nuevo Pago
          </DialogTitle>
          <DialogDescription>
            Registra un nuevo pago asociado a tu contrato de arriendo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4"
          >
            <FormField
              control={form.control}
              name="contractId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrato Asociado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un contrato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenantContracts
                        .map((contract) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.propertyName} ({contract.landlordName})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pago</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de pago" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="text" 
                      placeholder="Ej: 500.000"
                      value={formatCurrencyInput(field.value)}
                      onChange={e => field.onChange(parseCurrencyInput(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Pago</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles adicionales del pago..." {...field} value={field.value || ''} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachment"
              render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Adjuntar Comprobante (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(event) => {
                        const files = event.target.files;
                        setSelectedFileName(files?.[0]?.name || null);
                        onChange(files);
                      }}
                    />
                  </FormControl>
                  <UiFormDescription>
                    Puedes adjuntar una imagen o PDF como comprobante de pago (máx 5MB).
                  </UiFormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Declarando..." : "Declarar Pago"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
