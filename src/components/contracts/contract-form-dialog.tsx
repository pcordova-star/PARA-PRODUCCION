"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Contract, Property } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatRut, validateRut } from "@/lib/rutUtils";

// --- Funciones auxiliares para formato de moneda ---
const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\./g, ''), 10) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-CL').format(num);
};

const parseCurrency = (value: string): number | undefined => {
  if (!value) return undefined;
  const num = parseInt(value.replace(/\./g, ''), 10);
  return isNaN(num) ? undefined : num;
};

const formSchema = z.object({
  propertyId: z.string().min(1, "Debe seleccionar una propiedad."),
  tenantEmail: z.string().email("Email de arrendatario inválido."),
  tenantName: z.string().min(3, "Nombre de arrendatario requerido."),
  tenantRut: z.string().refine(validateRut, "RUT inválido"),
  
  startDate: z.date({ required_error: "Fecha de inicio requerida." }),
  endDate: z.date({ required_error: "Fecha de fin requerida." }),
  
  rentAmount: z.number().positive("El monto debe ser positivo."),
  rentPaymentDay: z.number().int().min(1).max(31).optional(),
  securityDepositAmount: z.number().positive("El monto debe ser positivo.").optional(),

  commonExpensesIncluded: z.enum(["incluidos", "no incluidos", "no aplica"]),
  commonExpensesPaymentDay: z.number().int().min(1).max(31).optional(),
  utilitiesPaymentDay: z.number().int().min(1).max(31).optional(),
  
  ipcAdjustment: z.boolean().optional(),
  ipcAdjustmentFrequency: z.enum(["trimestral", "semestral", "anual"]).optional(),
  
  propertyRolAvaluo: z.string().optional(),
  propertyCBRFojas: z.string().optional(),
  propertyCBRNumero: z.string().optional(),
  propertyCBRAno: z.number().int().positive().optional(),
  
  tenantNationality: z.string().optional(),
  tenantCivilStatus: z.string().optional(),
  tenantProfession: z.string().optional(),
  
  propertyUsage: z.enum(["Habitacional", "Comercial"], { required_error: "Debe seleccionar el uso de la propiedad." }),
  prohibitionToSublet: z.boolean().optional(),
  specialClauses: z.string().optional(),
}).refine(data => {
    if (data.ipcAdjustment && !data.ipcAdjustmentFrequency) {
        return false;
    }
    return true;
}, {
    message: "Debe seleccionar la frecuencia de reajuste si la opción está activada.",
    path: ["ipcAdjustmentFrequency"],
}).refine(data => data.endDate > data.startDate, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio.",
    path: ["endDate"],
});


type FormValues = z.infer<typeof formSchema>;

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FormValues) => void;
  contract?: Contract | null;
  userProperties: Property[];
  isSubmitting: boolean;
}

export function ContractFormDialog({ open, onOpenChange, onSave, contract, userProperties, isSubmitting }: ContractFormDialogProps) {
    const { toast } = useToast();
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ipcAdjustment: false,
            prohibitionToSublet: true,
            commonExpensesIncluded: "no aplica",
            propertyUsage: "Habitacional",
        },
    });

    const ipcAdjustment = form.watch("ipcAdjustment");
    const commonExpensesIncluded = form.watch("commonExpensesIncluded");

    useEffect(() => {
        if (open) {
          const defaultValues = contract ? {
            ...contract,
            startDate: new Date(contract.startDate),
            endDate: new Date(contract.endDate),
            securityDepositAmount: contract.securityDepositAmount ?? undefined,
            propertyCBRAno: contract.propertyCBRAno ?? undefined,
            propertyUsage: contract.propertyUsage || "Habitacional",
            rentPaymentDay: contract.rentPaymentDay ?? undefined,
            commonExpensesPaymentDay: contract.commonExpensesPaymentDay ?? undefined,
            utilitiesPaymentDay: contract.utilitiesPaymentDay ?? undefined,
            ipcAdjustmentFrequency: contract.ipcAdjustmentFrequency ?? undefined,
          } : {
            propertyId: "", tenantEmail: "", tenantName: "", tenantRut: "",
            commonExpensesIncluded: "no aplica",
            ipcAdjustment: false,
            prohibitionToSublet: true,
            propertyUsage: "Habitacional",
          };
          
          form.reset(defaultValues as any);
        }
    }, [contract, open, form]);

    const onSubmit = (values: FormValues) => {
        // Sanitize data before saving to Firestore
        const sanitizedValues = Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value === undefined ? null : value])
        );
        onSave(sanitizedValues as FormValues);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{contract ? "Editar Contrato" : "Crear Nuevo Contrato"}</DialogTitle>
                    <DialogDescription>
                        Completa los detalles del contrato. Los campos marcados con * son obligatorios.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-h-[70vh] overflow-y-auto p-4">
                        
                        <section>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Propiedad y Partes</h3>
                            <div className="space-y-4">
                                <FormField control={form.control} name="propertyId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Propiedad*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={!!contract}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una propiedad..." /></SelectTrigger></FormControl>
                                            <SelectContent>{userProperties && userProperties.map(prop => (<SelectItem key={prop.id} value={prop.id}>{prop.address}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="tenantEmail" render={({ field }) => (<FormItem><FormLabel>Email Arrendatario*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="tenantName" render={({ field }) => (<FormItem><FormLabel>Nombre Arrendatario*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="tenantRut" render={({ field }) => (<FormItem><FormLabel>RUT Arrendatario*</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(formatRut(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Fechas del Contrato</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Fecha de Inicio*</FormLabel>
                                            <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            field.onChange(date);
                                                            setIsStartDatePickerOpen(false);
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Fecha de Fin*</FormLabel>
                                            <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            field.onChange(date);
                                                            setIsEndDatePickerOpen(false);
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Condiciones Financieras</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="rentAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monto Arriendo (CLP)*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    value={formatCurrency(field.value)}
                                                    onChange={(e) => field.onChange(parseCurrency(e.target.value) || 0)}
                                                    placeholder="Ej: 750.000"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="securityDepositAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monto Garantía (CLP)</FormLabel>
                                            <FormControl>
                                                 <Input
                                                    type="text"
                                                    value={formatCurrency(field.value)}
                                                    onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                                                    placeholder="Ej: 750.000"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="rentPaymentDay" render={({ field }) => (<FormItem><FormLabel>Día de Pago Arriendo</FormLabel><FormControl><Input type="number" min={1} max={31} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="commonExpensesIncluded" render={({ field }) => (<FormItem><FormLabel>Gastos Comunes</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="incluidos">Incluidos en el arriendo</SelectItem><SelectItem value="no incluidos">Se pagan por separado</SelectItem><SelectItem value="no aplica">No aplica</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                {commonExpensesIncluded === 'no incluidos' && (
                                    <FormField control={form.control} name="commonExpensesPaymentDay" render={({ field }) => (<FormItem><FormLabel>Día Pago G. Comunes</FormLabel><FormControl><Input type="number" min={1} max={31} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                                )}
                                <FormField control={form.control} name="utilitiesPaymentDay" render={({ field }) => (<FormItem><FormLabel>Día Pago Cuentas</FormLabel><FormControl><Input type="number" min={1} max={31} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="mt-4">
                                <FormField control={form.control} name="ipcAdjustment" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Reajuste por IPC</FormLabel><FormDescription>¿El arriendo se reajustará según el IPC?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                {ipcAdjustment && <div className="mt-4"><FormField control={form.control} name="ipcAdjustmentFrequency" render={({ field }) => (<FormItem><FormLabel>Frecuencia de Reajuste IPC</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar frecuencia..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="trimestral">Trimestral</SelectItem><SelectItem value="semestral">Semestral</SelectItem><SelectItem value="anual">Anual</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/></div>}
                            </div>
                        </section>
                        
                        <section>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Identificación Legal de la Propiedad (Opcional)</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField control={form.control} name="propertyRolAvaluo" render={({ field }) => (<FormItem><FormLabel>Rol de Avalúo</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="propertyCBRFojas" render={({ field }) => (<FormItem><FormLabel>Fojas (CBR)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="propertyCBRNumero" render={({ field }) => (<FormItem><FormLabel>Número (CBR)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="propertyCBRAno" render={({ field }) => (<FormItem><FormLabel>Año (CBR)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Información Adicional del Arrendatario (Opcional)</h3>
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField control={form.control} name="tenantNationality" render={({ field }) => (<FormItem><FormLabel>Nacionalidad</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="tenantCivilStatus" render={({ field }) => (<FormItem><FormLabel>Estado Civil</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="tenantProfession" render={({ field }) => (<FormItem><FormLabel>Profesión</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </section>
                        
                        <section>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Cláusulas y Condiciones Adicionales</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="propertyUsage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Uso de la Propiedad*</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona el destino del inmueble" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Habitacional">Habitacional</SelectItem>
                                                    <SelectItem value="Comercial">Comercial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Define el propósito principal del arriendo.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="prohibitionToSublet" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Prohibición de Subarrendar</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="specialClauses" render={({ field }) => (<FormItem><FormLabel>Cláusulas Especiales (Opcional)</FormLabel><FormControl><Textarea placeholder="Ej: Se permite la tenencia de una mascota pequeña..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </section>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {contract ? "Guardar Cambios" : "Crear y Enviar a Arrendatario"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
