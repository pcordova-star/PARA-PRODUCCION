import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, FileText, Home, Scale, ShieldAlert } from 'lucide-react';
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
      description: 'Registre y administre sus propiedades de forma sencilla y centralizada.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Generación de Contratos',
      description: 'Cree contratos digitales válidos entre arrendadores y arrendatarios.',
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: 'Gestión de Pagos',
      description: 'Declare y apruebe pagos de arriendo de manera transparente.',
    },
    {
      icon: <ShieldAlert className="h-8 w-8 text-primary" />,
      title: 'Reporte de Incidentes',
      description: 'Registre y notifique cualquier incidente relacionado con la propiedad.',
    },
    {
      icon: <Scale className="h-8 w-8 text-primary" />,
      title: 'Cumplimiento Legal IA',
      description: 'Evalúe las condiciones de su propiedad con IA para asegurar el cumplimiento legal.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
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
        <section className="bg-card py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Sistema de Administración Responsable de Arriendos
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
              Una plataforma integral para la gestión de propiedades y arriendos, diseñada para fomentar la transparencia y la confianza entre arrendadores y arrendatarios.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Empezar Ahora</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Funcionalidades Principales
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Todo lo que necesita para una gestión de arriendos eficiente y segura.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col items-center p-6 text-center">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t">
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
