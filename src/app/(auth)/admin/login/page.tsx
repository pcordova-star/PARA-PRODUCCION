
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { createSessionCookie } from '@/app/actions';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && currentUser?.role === 'Administrador') {
      router.push('/dashboard');
    }
  }, [currentUser, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user role
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists() || userDocSnap.data().role !== 'Administrador') {
        setError('Acceso denegado. Esta cuenta no tiene privilegios de administrador.');
        await auth.signOut(); // Sign out the non-admin user
        setIsLoading(false);
        return;
      }
      
      const idToken = await user.getIdToken();
      await createSessionCookie(idToken);
      
      toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido, Administrador.' });
      router.push('/dashboard'); 

    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('El correo electrónico o la contraseña son incorrectos.');
      } else {
        setError('Ocurrió un error inesperado al intentar iniciar sesión.');
      }
      console.error("Admin login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || (!loading && currentUser?.role === 'Administrador')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-2">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-muted-foreground">Verificando sesión de administrador...</p>
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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <Shield className="h-8 w-8 text-primary"/>
            </div>
          <CardTitle className="text-2xl mt-2">Portal de Administración</CardTitle>
          <CardDescription>Inicia sesión con tu cuenta de administrador.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@sara-app.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ingresar como Administrador
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿No eres administrador?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
             <p className="text-xs text-muted-foreground">
              <Link href="/admin/signup" className="font-medium text-primary hover:underline">
                Crear cuenta de administrador
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
