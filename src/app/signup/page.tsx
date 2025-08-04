"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types";
import { auth } from "@/lib/firebase";
import { sendEmail } from "@/lib/notifications";
import { useEffect } from "react";


const formSchema = z.object({
  displayName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  role: z.enum(["Arrendador", "Arrendatario"], { required_error: "Debes seleccionar un rol." }),
  mobilePhone: z.string()
    .regex(/^(\+?[1-9]\d{1,14})$/, { message: "Formato de número de teléfono inválido. Incluye código de país (ej: +569...)" })
    .optional()
    .or(z.literal('')),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones para continuar.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { updateUserProfileInFirestore } = useAuth(); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      mobilePhone: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if(updateUserProfileInFirestore) {
        await updateUserProfileInFirestore(
          user.uid,
          values.email,
          values.role as UserRole,
          values.displayName,
          values.mobilePhone
        );
      }

      // Send welcome email
      await sendEmail({
        to: values.email,
        subject: "¡Bienvenido a S.A.R.A!",
        html: `
          <h1>Hola ${values.displayName},</h1>
          <p>Te damos la bienvenida a S.A.R.A - Sistema de Administración Responsable de Arriendos.</p>
          <p>Tu cuenta como <strong>${values.role}</strong> ha sido creada exitosamente. Ya puedes iniciar sesión y comenzar a gestionar tus arriendos de forma fácil y segura.</p>
          <p>Gracias por unirte a nuestra comunidad.</p>
          <p>El equipo de S.A.R.A</p>
        `,
      });

      toast({
        title: "Registro Exitoso",
        description: "Tu cuenta ha sido creada. Serás redirigido al dashboard.",
      });
      // The redirect will be handled by the parent component's useEffect
    } catch (error: any) {
      console.error("Error during registration:", error);
      toast({
        title: "Error de Registro",
        description: error.code === 'auth/email-already-in-use' ? 'Este correo electrónico ya está en uso.' : (error.message || "Ocurrió un error durante el registro."),
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="displayName" render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre Completo</FormLabel>
            <FormControl>
              <Input placeholder="Juan Pérez" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <Input placeholder="tu@correo.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="mobilePhone" render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Teléfono Móvil</FormLabel>
            <FormControl>
              <Input placeholder="+56912345678" {...field} />
            </FormControl>
            <FormDescription>
              Incluye el código de país (ej: +569). Opcional.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Soy un...</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Arrendador">Arrendador (Propietario)</SelectItem>
                <SelectItem value="Arrendatario">Arrendatario (Busco arriendo)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Esto determinará cómo usas S.A.R.A.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="acceptTerms" render={({ field }) => (
          <FormItem className="flex items-start space-x-3 rounded-md border p-4 shadow-sm">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Acepto los <Link href="/terminos-y-condiciones" className="text-primary hover:underline" target="_blank">términos y condiciones</Link>.
              </FormLabel>
            </div>
          </FormItem>
        )} />
         <FormMessage>{form.formState.errors.acceptTerms?.message}</FormMessage>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Registrando..." : <><UserPlus className="mr-2 h-4 w-4" />Crear Cuenta</>}
        </Button>
      </form>
    </Form>
  );
}


export default function SignupPage() {
    const router = useRouter();
    const { currentUser, loading } = useAuth();

    useEffect(() => {
        if (!loading && currentUser) {
            router.push('/dashboard');
        }
    }, [currentUser, loading, router]);

    if (loading || (!loading && currentUser)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verificando sesión...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="absolute top-6 left-6">
                <Link href="/" className="flex items-center gap-2 text-primary" prefetch={false}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
                    <span className="text-xl font-bold">S.A.R.A</span>
                </Link>
            </div>
            <div className="w-full max-w-md shadow-lg rounded-lg border bg-card text-card-foreground p-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">Crear una Cuenta</h1>
                    <p className="text-muted-foreground">Regístrese para empezar a usar S.A.R.A.</p>
                </div>
                <RegisterForm />
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                    ¿Ya tiene una cuenta?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Iniciar Sesión
                    </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
