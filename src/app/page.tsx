
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    FileText, Bell, ShieldAlert, FileBadge, UploadCloud, Scale, Rocket, ArrowRight, ArrowLeft, Star, TrendingUp, User, PlusCircle, CheckCircle, Mail, Facebook, Twitter, Linkedin, Gavel, Send, Download, Instagram
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
      <span className="text-xl font-bold">S.A.R.A</span>
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

const howItWorksSteps = [
    { 
      icon: <User className="h-8 w-8" />, 
      title: '1. Regístrate', 
      description: 'Crea tu perfil como arrendador o arrendatario en segundos.',
      simulation: (
        <div className="space-y-3 p-4">
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Nombre</label>
                <motion.div initial={{width: 0}} animate={{width: '100%'}} transition={{duration: 0.5}} className="bg-gray-200 rounded-full h-4"></motion.div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Email</label>
                <motion.div initial={{width: 0}} animate={{width: '100%'}} transition={{duration: 0.5, delay: 0.2}} className="bg-gray-200 rounded-full h-4"></motion.div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Rol</label>
                <motion.div initial={{width: 0}} animate={{width: '66%'}} transition={{duration: 0.5, delay: 0.4}} className="bg-gray-200 rounded-full h-4"></motion.div>
            </div>
        </div>
      )
    },
    { 
      icon: <PlusCircle className="h-8 w-8" />, 
      title: '2. Crea y Envía', 
      description: 'El arrendador crea el contrato y lo envía para aceptación digital.',
      simulation: (
         <div className="space-y-3 p-4">
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Propiedad</label>
                <motion.div initial={{width: 0}} animate={{width: '100%'}} transition={{duration: 0.5}} className="bg-gray-200 rounded-full h-4"></motion.div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Monto Arriendo</label>
                 <motion.div initial={{width: 0}} animate={{width: '50%'}} transition={{duration: 0.5, delay: 0.2}} className="bg-gray-200 rounded-full h-4"></motion.div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Email Arrendatario</label>
                <motion.div initial={{width: 0}} animate={{width: '100%'}} transition={{duration: 0.5, delay: 0.4}} className="bg-gray-200 rounded-full h-4"></motion.div>
            </div>
        </div>
      )
    },
    { 
      icon: <CheckCircle className="h-8 w-8" />, 
      title: '3. Acepta Digitalmente', 
      description: 'El arrendatario revisa y acepta el contrato desde cualquier dispositivo.',
      simulation: (
        <div className="flex flex-col items-center justify-center p-4 h-full">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                    <CheckCircle className="mr-2 h-5 w-5"/>
                    Aceptar Contrato
                </Button>
            </motion.div>
            <p className="text-xs text-gray-500 mt-3">Aceptación con validez legal</p>
        </div>
      )
    },
    { 
      icon: <Mail className="h-8 w-8" />, 
      title: '4. Gestiona', 
      description: 'Administra pagos, incidentes y comunicaciones en un solo lugar.',
      simulation: (
         <div className="p-4">
            <p className="text-sm font-semibold mb-2">Panel de Control</p>
            <div className="space-y-2">
                <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.2}} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                    <span className="text-xs text-green-800">Pago Arriendo - Aceptado</span>
                    <div className="w-1/4 bg-green-200 h-3 rounded-full"></div>
                </motion.div>
                 <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.4}} className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
                    <span className="text-xs text-yellow-800">Incidente: Gotera - Pendiente</span>
                    <div className="w-1/3 bg-yellow-200 h-3 rounded-full"></div>
                </motion.div>
                 <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.6}} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                    <span className="text-xs text-blue-800">Evaluación Recibida</span>
                    <div className="w-1/2 bg-blue-200 h-3 rounded-full"></div>
                </motion.div>
            </div>
        </div>
      )
    },
  ];

// Animated Counter for the Report Score
const AnimatedCounter = ({ to }: { to: number }) => {
    const ref = React.useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView && ref.current) {
            const controls = animate(0, to, {
                duration: 2,
                ease: "easeOut",
                onUpdate(value) {
                    if (ref.current) {
                        ref.current.textContent = value.toFixed(1);
                    }
                },
            });
            return () => controls.stop();
        }
    }, [isInView, to]);

    return <span ref={ref}>0.0</span>;
};


const HomePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const direction = useState(0);

  const handleNext = () => {
    direction[0] = 1;
    setActiveStep((prev) => (prev + 1) % howItWorksSteps.length);
  };
  const handlePrev = () => {
    direction[0] = -1;
    setActiveStep((prev) => (prev - 1 + howItWorksSteps.length) % howItWorksSteps.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const features = [
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: 'Contratos Digitales Seguros',
      description: 'Crea y firma contratos de arriendo con validez legal de forma 100% digital, ahorrando tiempo y papel.',
    },
    {
      icon: <Bell className="h-10 w-10 text-primary" />,
      title: 'Notificaciones Inteligentes',
      description: 'Recordatorios automáticos de fechas de pago y vencimientos para mantener todo al día sin esfuerzo.',
    },
    {
      icon: <ShieldAlert className="h-10 w-10 text-primary" />,
      title: 'Gestión de Incidentes',
      description: 'Canaliza y documenta todas las solicitudes e incidentes, desde reparaciones hasta problemas de convivencia.',
    },
    {
      icon: <FileBadge className="h-10 w-10 text-primary" />,
      title: 'Certificado de Arrendatario',
      description: 'Genera un historial de comportamiento y pagos para facilitar futuras postulaciones a arriendos.',
    },
    {
      icon: <UploadCloud className="h-10 w-10 text-primary" />,
      title: 'Onboarding Asistido',
      description: 'Carga masiva de propiedades y contratos existentes para una transición sin complicaciones a S.A.R.A.',
    },
    {
      icon: <Scale className="h-10 w-10 text-primary" />,
      title: 'Dossier Legal Automatizado',
      description: 'Con un solo clic, compila todo el historial (pagos, incidentes, etc.) en un documento listo para procesos legales.',
    },
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
        <section className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4 text-center md:text-left py-20 md:py-32">
          <div>
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
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:mx-0"
            >
              S.A.R.A es la plataforma todo-en-uno que automatiza y transparenta la administración de tus arriendos, protegiendo tanto a arrendadores como a arrendatarios.
            </motion.p>
            <motion.div 
              variants={fadeIn('up', 0.4)}
              initial="initial"
              animate="animate"
              className="mt-8 flex justify-center md:justify-start gap-4"
            >
              <Button size="lg" asChild>
                <Link href="/signup">Empezar Ahora</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div 
            variants={fadeIn('left', 0.2)}
            initial="initial"
            animate="animate"
            className="relative h-64 md:h-96 w-full"
          >
            <Image src="/images/logo2.png" alt="Plataforma S.A.R.A en un dispositivo" layout="fill" objectFit="contain" className="rounded-lg animate-mockupAnimation" />
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
                        className="font-headline text-3xl font-bold md:text-4xl">Fácil, Rápido e Intuitivo</motion.h2>
                    <motion.p 
                        variants={fadeIn('up', 0.2)} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                        className="mt-4 text-lg text-muted-foreground">Mira lo simple que es gestionar tus arriendos con S.A.R.A.</motion.p>
                </div>
                <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        {howItWorksSteps.map((step, index) => (
                           <motion.div
                             key={index}
                             onClick={() => setActiveStep(index)}
                             className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${activeStep === index ? 'border-primary shadow-lg bg-primary/5' : 'border-transparent hover:bg-muted/50'}`}
                             variants={fadeIn('up', index * 0.1)}
                             whileInView="animate"
                             initial="initial"
                             viewport={{ once: true, amount: 0.8 }}
                           >
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                           </motion.div>
                        ))}
                    </div>

                    <div className="relative h-96 bg-background rounded-xl shadow-2xl p-4 border flex flex-col justify-between">
                         <div className="flex items-center gap-1.5 mb-2">
                            <span className="h-3 w-3 rounded-full bg-red-500"></span>
                            <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                            <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="flex-grow relative overflow-hidden">
                           <AnimatePresence initial={false} custom={direction[0]}>
                                <motion.div
                                    key={activeStep}
                                    custom={direction[0]}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="absolute w-full h-full"
                                >
                                    {howItWorksSteps[activeStep].simulation}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                         <div className="flex justify-between items-center pt-2">
                            <Button variant="outline" size="sm" onClick={handlePrev}><ArrowLeft className="mr-2 h-4 w-4"/> Anterior</Button>
                            <div className="flex gap-2">
                                {howItWorksSteps.map((_, index) => (
                                    <button key={index} onClick={() => setActiveStep(index)} className={`h-2 w-2 rounded-full transition-all ${activeStep === index ? 'w-6 bg-primary' : 'bg-muted'}`}></button>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={handleNext}>Siguiente <ArrowRight className="ml-2 h-4 w-4"/></Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="reporte" className="py-20 md:py-32">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    variants={fadeIn('right')} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                >
                    <h2 className="font-headline text-3xl font-bold md:text-4xl">Tu Carta de Presentación como <span className="text-primary">Arrendatario Ejemplar</span></h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Con S.A.R.A, cada pago puntual y cada interacción positiva construye tu reputación. Nuestro "Informe de Comportamiento" es un certificado digital que valida tu excelente historial.
                    </p>
                    <p className="mt-4 text-lg text-muted-foreground">
                       Úsalo para destacar en futuras postulaciones y acceder a las mejores propiedades, demostrando con datos que eres el arrendatario que todos desean.
                    </p>
                     <Button size="lg" asChild className="mt-8">
                        <Link href="/signup">Construye tu Historial</Link>
                    </Button>
                </motion.div>
                <motion.div 
                    variants={fadeIn('left')} whileInView="animate" initial="initial" viewport={{ once: true, amount: 0.5 }}
                >
                    <Card className="p-6 shadow-2xl relative overflow-hidden">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Informe de Comportamiento</CardTitle>
                            <p className="text-muted-foreground">Juanito Pérez</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <p className="text-lg font-semibold">Puntaje Global</p>
                                <p className="text-5xl font-bold text-primary">
                                    <AnimatedCounter to={4.8} />
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span>Puntualidad de Pagos</span><span className="font-medium">Excelente</span></div>
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '95%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}><Progress value={95} className="h-2" /></motion.div>
                            </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span>Cuidado de Propiedad</span><span className="font-medium">Muy Bueno</span></div>
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}><Progress value={85} className="h-2" /></motion.div>
                            </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span>Comunicación</span><span className="font-medium">Excelente</span></div>
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '98%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}><Progress value={98} className="h-2" /></motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </section>

        <section id="ley" className="py-20 md:py-32 bg-card">
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
                >
                   <Card className="p-6 shadow-2xl w-full max-w-md mx-auto">
                        <CardHeader className="text-center">
                            <FileBadge className="mx-auto h-12 w-12 text-primary" />
                            <CardTitle className="text-2xl mt-4">Compilación de Dossier Legal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-left">
                            <motion.div initial={{opacity: 0}} whileInView={{opacity: 1}} transition={{delay: 0.2}} className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Contrato de Arriendo.</motion.div>
                            <motion.div initial={{opacity: 0}} whileInView={{opacity: 1}} transition={{delay: 0.4}} className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Historial de Pagos completo.</motion.div>
                            <motion.div initial={{opacity: 0}} whileInView={{opacity: 1}} transition={{delay: 0.6}} className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Registro de Incidentes y Comentarios.</motion.div>
                            <motion.div initial={{opacity: 0}} whileInView={{opacity: 1}} transition={{delay: 0.8}} className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Evaluaciones de Comportamiento.</motion.div>
                        </CardContent>
                        <div className="p-6 pt-2">
                             <motion.div initial={{opacity: 0}} whileInView={{opacity: 1}} transition={{delay: 1}}>
                                <Button size="lg" className="w-full bg-primary/90 hover:bg-primary">
                                    <Download className="mr-2 h-4 w-4"/>
                                    Generar Dossier
                                </Button>
                             </motion.div>
                        </div>
                   </Card>
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
                        <li><Link href="/terms" className="hover:text-primary">Términos y Condiciones</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary">Política de Privacidad</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold">Síguenos</h3>
                    <div className="flex gap-4 mt-2">
                        <Link href="https://www.instagram.com/sarachile2025" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Instagram className="h-6 w-6" />
                            <span className="sr-only">Instagram</span>
                        </Link>
                        <Link href="https://www.facebook.com/Sarachile" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Facebook className="h-6 w-6" />
                            <span className="sr-only">Facebook</span>
                        </Link>
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
