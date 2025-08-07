
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/types";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  displayName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

function AdminRegisterForm() {
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
          "Administrador", // Hardcoded role
          values.displayName
        );
      }

      toast({
        title: "Cuenta de Administrador Creada",
        description: "La cuenta ha sido creada exitosamente.",
      });
      
      router.push('/admin/login');

    } catch (error: any) {
      console.error("Error during admin registration:", error);
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
              <Input placeholder="Nombre del Administrador" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <Input placeholder="admin@sara-app.com" {...field} />
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
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Registrando..." : <><UserPlus className="mr-2 h-4 w-4" />Crear Cuenta de Administrador</>}
        </Button>
      </form>
    </Form>
  );
}


export default function AdminSignupPage() {
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
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Shield className="h-8 w-8 text-primary"/>
                    </div>
                    <h1 className="text-2xl font-bold mt-2">Registro de Administrador</h1>
                    <p className="text-muted-foreground">Crea una nueva cuenta con privilegios de administrador.</p>
                </div>
                <AdminRegisterForm />
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta de administrador?{' '}
                    <Link href="/admin/login" className="font-medium text-primary hover:underline">
                        Iniciar Sesión
                    </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
