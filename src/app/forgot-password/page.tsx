
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo electrónico válido." }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handlePasswordReset = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setEmailSent(false);

    try {
      await sendPasswordResetEmail(auth, values.email);
      setEmailSent(true);
      toast({
        title: 'Correo Enviado',
        description: 'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No se encontró ninguna cuenta con ese correo electrónico.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
      }
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-primary" prefetch={false}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
          <span className="text-xl font-bold">S.A.R.A</span>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <CardDescription>Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.</CardDescription>
        </CardHeader>
        {emailSent ? (
          <CardContent>
            <Alert variant="default" className="border-green-500 text-green-700">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                ¡Correo enviado! Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar el enlace de restablecimiento.
                </AlertDescription>
            </Alert>
          </CardContent>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePasswordReset)}>
                <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <FormControl>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="usuario@ejemplo.com" 
                            disabled={isLoading}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Enlace
                </Button>
                </CardFooter>
            </form>
            </Form>
        )}
         <div className="mt-4 text-center text-sm pb-6">
            <Link href="/login" className="font-medium text-primary hover:underline">
                Volver a Iniciar Sesión
            </Link>
        </div>
      </Card>
    </div>
  );
}
