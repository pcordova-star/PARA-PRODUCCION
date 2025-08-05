
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, Star } from "lucide-react";
import type { Contract, EvaluationCriteria } from "@/types";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const evaluationCriteriaSchema = z.object({
  paymentPunctuality: z.coerce.number().int().min(1).max(5),
  propertyCare: z.coerce.number().int().min(1).max(5),
  communication: z.coerce.number().int().min(1).max(5),
  generalBehavior: z.coerce.number().int().min(1).max(5),
});

const evaluationFormSchema = z.object({
  contractId: z.string().min(1, { message: "Debes seleccionar un contrato." }),
  criteria: evaluationCriteriaSchema,
});

export type EvaluationFormValues = z.infer<typeof evaluationFormSchema>;

interface EvaluationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EvaluationFormValues) => Promise<void>;
  landlordContracts: Contract[];
}

const criteriaLabels: Record<keyof EvaluationCriteria, string> = {
  paymentPunctuality: "Puntualidad en los Pagos",
  propertyCare: "Cuidado de la Propiedad",
  communication: "Comunicación",
  generalBehavior: "Convivencia General",
};

export function EvaluationFormDialog({ open, onOpenChange, onSave, landlordContracts }: EvaluationFormDialogProps) {
  const { toast } = useToast();

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: {
      contractId: "",
      criteria: {
        paymentPunctuality: 3,
        propertyCare: 3,
        communication: 3,
        generalBehavior: 3,
      },
    },
  });

  const handleSave = async (values: EvaluationFormValues) => {
    try {
      await onSave(values);
      toast({ title: "Evaluación Guardada", description: "La evaluación ha sido guardada y está pendiente de confirmación por el arrendatario." });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error al Guardar", description: "No se pudo guardar la evaluación.", variant: "destructive" });
      console.error("Error saving evaluation:", error);
    }
  };
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        contractId: landlordContracts[0]?.id || "",
        criteria: {
          paymentPunctuality: 3,
          propertyCare: 3,
          communication: 3,
          generalBehavior: 3,
        },
      });
    }
  }, [open, form, landlordContracts]);

  const selectedContractId = form.watch("contractId");
  const selectedContract = landlordContracts.find(c => c.id === selectedContractId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) form.reset();
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-primary" /> Evaluar Arrendatario
            {selectedContract && (
              <span className="text-sm font-normal ml-1 text-muted-foreground"> ({selectedContract.tenantName} - {selectedContract.propertyName})</span>
            )}
          </DialogTitle>
          <DialogDescription>
            Califica al arrendatario según los siguientes criterios (1-5 estrellas).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <FormField
              control={form.control}
              name="contractId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrato Asociado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un contrato activo o finalizado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {landlordContracts.map(contract => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.propertyName} (Arrendatario: {contract.tenantName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(Object.keys(criteriaLabels) as Array<keyof EvaluationCriteria>).map((criterionKey) => (
              <FormField
                key={criterionKey}
                control={form.control}
                name={`criteria.${criterionKey}`}
                render={({ field }) => (
                  <FormItem className="rounded-md border p-3">
                    <FormLabel>{criteriaLabels[criterionKey]}</FormLabel>
                    <FormControl>
                        <div className="flex items-center space-x-2 pt-1">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                            <Button
                            key={starValue}
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 p-0 text-muted-foreground hover:text-yellow-400`}
                            onClick={() => field.onChange(starValue)}
                            >
                            <Star className={`h-6 w-6 transition-colors ${field.value >= starValue ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                        ))}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar Evaluación"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
