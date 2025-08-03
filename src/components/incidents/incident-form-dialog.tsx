"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Paperclip, AlertTriangle } from "lucide-react";
import type {
  Contract,
  IncidentType,
  UserRole,
  IncidentFormValues,
} from "@/types";
import { useToast } from "@/hooks/use-toast";

const incidentTypes: IncidentType[] = [
  "pago",
  "cuidado de la propiedad",
  "ruidos molestos",
  "reparaciones necesarias",
  "incumplimiento de contrato",
  "otros",
];

const incidentFormSchema = z.object({
  contractId: z.string().min(1, { message: "Debes seleccionar un contrato." }),
  type: z.enum(incidentTypes, {
    required_error: "Debes seleccionar un tipo de incidente.",
  }),
  description: z
    .string()
    .min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  initialAttachment: z
    .custom<FileList>((val) => val instanceof FileList, "Se esperaba un archivo")
    .refine((files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024, `El tamaño máximo es 5MB.`)
    .optional(),
});

export type IncidentFormDialogValues = z.infer<typeof incidentFormSchema>;

interface IncidentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: IncidentFormDialogValues & { initialAttachmentUrl: string | null; initialAttachmentName: string | null; }) => Promise<void>;
  userContracts: Contract[];
  currentUserRole: UserRole | null;
}

export function IncidentFormDialog({
  open,
  onOpenChange,
  onSave,
  userContracts,
  currentUserRole,
}: IncidentFormDialogProps) {
  const { toast } = useToast();
  const [selectedInitialFileName, setSelectedInitialFileName] =
    useState<string | null>(null);

  const form = useForm<IncidentFormDialogValues>({
    resolver: zodResolver(incidentFormSchema),
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        contractId: userContracts.find((c) => c.status === "Activo")?.id || "",
        type: "otros",
        description: "",
        initialAttachment: undefined,
      });
      setSelectedInitialFileName(null);
    }
  }, [open, userContracts, form]);
  

  async function onSubmit(values: IncidentFormDialogValues) {
    if (!currentUserRole) {
      toast({
        title: "Error de Permiso",
        description: "No se pudo determinar el rol del usuario.",
        variant: "destructive",
      });
      return;
    }

    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;

    if (values.initialAttachment && values.initialAttachment.length > 0) {
      const file = values.initialAttachment[0];
      attachmentName = file.name;

      // MOCK UPLOAD
      toast({ title: "Subiendo archivo...", description: `Simulando subida de ${file.name}.` });
      await new Promise(resolve => setTimeout(resolve, 1500));
      attachmentUrl = `https://mockstorage.com/incidents/${Date.now()}_${attachmentName}`;
      toast({ title: "Archivo Adjunto", description: "Comprobante subido exitosamente (simulado)." });
    }

    await onSave({ 
      ...values, 
      initialAttachmentUrl: attachmentUrl, 
      initialAttachmentName: attachmentName 
    });

    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-primary" /> Crear Nuevo
            Incidente
          </DialogTitle>
          <DialogDescription>
            Describe el incidente para notificar a la otra parte.
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
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        {userContracts
                          .filter((c) => c.status === "Activo")
                          .map((contract) => (
                            <SelectItem key={contract.id} value={contract.id}>
                              {contract.propertyName} (
                              {currentUserRole === "Arrendador"
                                ? `Arrendatario: ${
                                    contract.tenantName || contract.tenantEmail
                                  }`
                                : `Arrendador: ${contract.landlordName}`}
                              )
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Incidente</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {incidentTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Incidente</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalla el incidente..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialAttachment"
              render={({ field: { onChange, value, ...rest }}) => (
                <FormItem>
                  <FormLabel>Adjuntar Archivo (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(event) => {
                        const files = event.target.files;
                        setSelectedInitialFileName(files?.[0]?.name || null);
                        onChange(files);
                      }}
                      {...rest}
                    />
                  </FormControl>
                   <UiFormDescription>
                    Puedes adjuntar imágenes o PDF como evidencia (máx. 5MB).
                  </UiFormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={form.formState.isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creando..." : "Crear Incidente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
