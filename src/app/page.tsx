import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, FileText, Home, MessageSquare } from 'lucide-react';
import Link from 'next/link';

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
      <span className="text-2xl font-bold">S.A.R.A</span>
    </div>
  );
}

export default function HomePage() {
  const features = [
    {
      icon: <Home className="h-8 w-8 text-primary" />,
      title: 'Gestión de Propiedades',
      description: 'Administra todas tus propiedades en un solo lugar. Sube documentos, asigna inquilinos y lleva un registro completo.',
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: 'Control de Pagos',
      description: 'Registra y monitorea los pagos de arriendo de forma sencilla, con notificaciones y recordatorios automáticos.',
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: 'Comunicación Directa',
      description: 'Un canal de comunicación directo y documentado entre arrendadores e inquilinos para gestionar incidentes y solicitudes.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 bg-gray-50">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Registrarse</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 md:py-28">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Bienvenido a S.A.R.A
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
            Tu Asistente de Arriendo y Recuperación Automatizada. Simplificamos la gestión de propiedades para arrendadores y la vida de los inquilinos.
            </p>
        </section>

        <section id="features" className="w-full py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
              Funcionalidades Principales
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col items-center p-6 text-center shadow-lg border-t-4 border-primary">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 md:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} S.A.R.A. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
