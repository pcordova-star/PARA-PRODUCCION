
"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, MessageSquare, Loader2 } from "lucide-react";
import type { Incident, UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";

const incidentResponseFormSchema = z.object({
  responseText: z.string().min(10, {message: "La respuesta debe tener al menos 10 caracteres."}),
  responseAttachment: z
    .custom<FileList>((v) => v instanceof FileList, "Se esperaba un archivo")
    .refine((files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024, `El tamaño máximo es 5MB.`)
    .optional(),
});

export type IncidentResponseFormValues = z.infer<
  typeof incidentResponseFormSchema
>;

interface IncidentResponseDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (incidentId: string, data: any) => Promise<void>;
  currentUserRole: UserRole | null;
}

export function IncidentResponseDialog({
  incident,
  open,
  onOpenChange,
  onSave,
  currentUserRole,
}: IncidentResponseDialogProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IncidentResponseFormValues>({
    resolver: zodResolver(incidentResponseFormSchema),
  });
  
  React.useEffect(() => {
      if (open) {
          form.reset({ responseText: "", responseAttachment: undefined });
      }
  }, [open, form]);

  async function onSubmit(values: IncidentResponseFormValues) {
    if (!currentUserRole || !incident || !currentUser) {
      toast({ title: "Error", description: "No permitido.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);

    try {
        const dataToSave: { 
            responseText: string;
            responseAttachmentUrl?: string;
            responseAttachmentName?: string;
        } = {
            responseText: values.responseText,
        };

        if (values.responseAttachment?.length) {
          const file = values.responseAttachment[0];
          dataToSave.responseAttachmentName = file.name;
          const storageRef = ref(storage, `incident-attachments/${currentUser.uid}/responses/${Date.now()}-${file.name}`);
          
          toast({ title: "Subiendo archivo...", description: "Por favor espera." });
          const snapshot = await uploadBytes(storageRef, file);
          dataToSave.responseAttachmentUrl = await getDownloadURL(snapshot.ref);
          toast({ title: "Archivo Adjunto", description: "Comprobante subido exitosamente." });
        }

        await onSave(incident.id, dataToSave);
        form.reset();
    } catch (error) {
         console.error("Error submitting response:", error);
         toast({ title: "Error de Envío", description: "No se pudo guardar la respuesta.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare /> Responder Incidente
          </DialogTitle>
          <DialogDescription>
            Incidente sobre {incident.propertyName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <FormField
              control={form.control}
              name="responseText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Respuesta</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Escribe tu respuesta aquí..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="responseAttachment"
              render={({ field: { onChange, value, ...rest }}) => (
                <FormItem>
                  <FormLabel>Adjuntar Archivo (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(event) => {
                        onChange(event.target.files);
                      }}
                      {...rest}
                    />
                  </FormControl>
                   <FormDescription>
                    Puedes adjuntar imágenes o PDF como evidencia (máx. 5MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
