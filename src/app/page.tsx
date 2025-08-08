
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Save, Bell, CheckCircle, Mail, Lock, User, PlusCircle, 
    Facebook, Twitter, Linkedin, ShieldCheck, AlertTriangle, Rocket 
} from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
      <span className="text-2xl font-bold">S.A.R.A</span>
    </div>
  );
}

const fadeIn = (direction = 'up', delay = 0) => ({
  initial: {
    y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
    x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
    opacity: 0,
  },
  animate: {
    y: 0,
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      delay,
    },
  },
});

const HomePage = () => {
  const features = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Contratos Digitales Seguros',
      description: 'Crea, envía y firma contratos de arriendo con validez legal de forma 100% digital y segura.',
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: 'Notificaciones Inteligentes',
      description: 'Recordatorios automáticos de fechas de pago, reajustes de IPC y vencimiento de contratos.',
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-primary" />,
      title: 'Gestión de Incidentes',
      description: 'Canaliza y documenta todas las solicitudes e incidentes, desde reparaciones hasta problemas de convivencia.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Certificado de Arrendatario',
      description: 'Genera un historial de comportamiento y pagos para facilitar futuras postulaciones a arriendos.',
    },
    {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: 'Onboarding Asistido',
      description: 'Carga masiva de propiedades y contratos existentes para una transición sin complicaciones a S.A.R.A.',
    },
    {
      icon: <Save className="h-8 w-8 text-primary" />,
      title: 'Dossier Legal Automatizado',
      description: 'Con un solo clic, compila todo el historial (pagos, incidentes, etc.) en un documento listo para procesos legales.',
    },
  ];

  const howItWorksSteps = [
    { icon: <User className="h-8 w-8" />, title: 'Regístrate', description: 'Crea tu perfil como arrendador o arrendatario en segundos.' },
    { icon: <PlusCircle className="h-8 w-8" />, title: 'Crea y Envía', description: 'El arrendador crea el contrato y lo envía para la firma digital.' },
    { icon: <CheckCircle className="h-8 w-8" />, title: 'Firma Digitalmente', description: 'El arrendatario revisa y firma el contrato desde cualquier dispositivo.' },
    { icon: <Mail className="h-8 w-8" />, title: 'Gestiona', description: 'Administra pagos, incidentes y comunicaciones en un solo lugar.' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <motion.header 
        variants={fadeIn('down')}
        initial="initial"
        animate="animate"
        className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <Logo />
        <nav className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Probar Gratis</Link>
          </Button>
        </nav>
      </motion.header>

      <main className="flex-1">
        <section className="container mx-auto px-4 text-center py-20 md:py-32">
          <motion.h1 
            variants={fadeIn('up')}
            initial="initial"
            animate="animate"
            className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-6xl"
          >
            La Gestión de Arriendos, <span className="text-primary">Simplificada y Segura.</span>
          </motion.h1>
          <motion.p 
            variants={fadeIn('up', 0.2)}
            initial="initial"
            animate="animate"
            className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground"
          >
            S.A.R.A es la plataforma todo-en-uno que automatiza y transparenta la administración de tus arriendos, protegiendo tanto a arrendadores como a arrendatarios.
          </motion.p>
          <motion.div 
            variants={fadeIn('up', 0.4)}
            initial="initial"
            animate="animate"
            className="mt-8 flex justify-center gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/signup">Empezar Ahora</Link>
            </Button>
          </motion.div>
        </section>
        
        <section className="bg-card py-16">
            <motion.div 
              variants={fadeIn('up')}
              whileInView="animate"
              initial="initial"
              viewport={{ once: true, amount: 0.5 }}
              className="container mx-auto px-4 text-center"
            >
                <h2 className="text-2xl md:text-3xl font-semibold italic text-foreground">"La tranquilidad de tener todo el historial de tu arriendo en un solo lugar, no tiene precio."</h2>
            </motion.div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <motion.h2 
                variants={fadeIn('up')} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                className="font-headline text-3xl font-bold md:text-4xl"
              >
                Todo lo que necesitas, en una sola plataforma.
              </motion.h2>
              <motion.p 
                variants={fadeIn('up', 0.2)} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                className="mt-4 text-lg text-muted-foreground"
              >
                Desde la creación del contrato hasta la recuperación legal, S.A.R.A te respalda.
              </motion.p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn('up', index * 0.1)}
                  whileInView="animate"
                  initial="initial"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <Card className="flex flex-col h-full items-center p-6 text-center shadow-lg hover:shadow-primary/20 transition-shadow">
                    <CardHeader>
                      {feature.icon}
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-card py-20 md:py-32">
            <div className="container mx-auto px-4">
                 <div className="text-center">
                    <motion.h2 
                        variants={fadeIn('up')} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                        className="font-headline text-3xl font-bold md:text-4xl">¿Cómo funciona?</motion.h2>
                    <motion.p 
                        variants={fadeIn('up', 0.2)} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                        className="mt-4 text-lg text-muted-foreground">Empezar es más fácil de lo que crees.</motion.p>
                </div>
                <div className="relative mt-16 grid gap-16 md:grid-cols-4">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-4/5 bg-border hidden md:block"></div>
                    {howItWorksSteps.map((step, index) => (
                        <motion.div 
                            key={index}
                            variants={fadeIn('up', index * 0.1)}
                            whileInView="animate"
                            initial="initial"
                            viewport={{ once: true, amount: 0.5 }}
                            className="relative flex flex-col items-center text-center"
                        >
                            <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary z-10 bg-background">
                                {step.icon}
                            </div>
                            <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                            <p className="mt-2 text-muted-foreground">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <section id="ley" className="py-20 md:py-32">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    variants={fadeIn('right')} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                >
                    <h2 className="font-headline text-3xl font-bold md:text-4xl">Prepárate para la Ley <span className="text-primary">"Devuélveme mi casa"</span></h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        La ley exige un registro formal y evidencia clara de los incumplimientos. S.A.R.A genera automáticamente un dossier legal con todo el historial del arriendo: pagos, comunicaciones, multas e incidentes. 
                    </p>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Con nuestra plataforma, tendrás la documentación que necesitas para iniciar un proceso de restitución de forma rápida y efectiva, ahorrándote tiempo y dinero.
                    </p>
                     <Button size="lg" asChild className="mt-8">
                        <Link href="/signup">Protégete Ahora</Link>
                    </Button>
                </motion.div>
                <motion.div 
                    variants={fadeIn('left')} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                    className="relative h-96"
                >
                     <Image src="https://placehold.co/600x400.png" alt="Documentación Legal" layout="fill" objectFit="cover" className="rounded-lg shadow-xl" data-ai-hint="legal documents" />
                </motion.div>
            </div>
        </section>
      </main>

      <motion.footer 
        variants={fadeIn('up')}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, amount: 0.5 }}
        className="bg-card border-t"
      >
        <div className="container mx-auto px-4 py-8 md:px-6">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                    <Logo />
                    <p className="text-sm text-muted-foreground mt-2">Simplificando la gestión de arriendos en Chile.</p>
                </div>
                <div>
                    <h3 className="font-semibold">Producto</h3>
                    <ul className="space-y-2 mt-2 text-sm text-muted-foreground">
                        <li><Link href="#features" className="hover:text-primary">Funcionalidades</Link></li>
                        <li><Link href="#how-it-works" className="hover:text-primary">Cómo Funciona</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold">Legal</h3>
                    <ul className="space-y-2 mt-2 text-sm text-muted-foreground">
                        <li><Link href="#" className="hover:text-primary">Términos y Condiciones</Link></li>
                        <li><Link href="#" className="hover:text-primary">Política de Privacidad</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold">Síguenos</h3>
                    <div className="flex gap-4 mt-2">
                        <Link href="#"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary"/></Link>
                        <Link href="#"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary"/></Link>
                        <Link href="#"><Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary"/></Link>
                    </div>
                </div>
            </div>
             <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} S.A.R.A. Todos los derechos reservados.</p>
            </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default HomePage;
