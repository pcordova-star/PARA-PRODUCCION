
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserNav } from '@/components/user-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, FileText, CreditCard, ShieldAlert, Scale, LayoutDashboard, LogOut, ClipboardCheck, Calendar, FileBadge, AlertTriangle, Rocket, Loader2, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInDays, parseISO } from 'date-fns';
import { sendUpgradeRequestEmail } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
       <h1 className="text-xl font-bold text-foreground">S.A.R.A</h1>
    </Link>
  );
}

function TrialBanner({ user }: { user: UserProfile }) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  if (!user.trialEndsAt) return null;

  const endDate = parseISO(user.trialEndsAt);
  const today = new Date();
  const daysLeft = differenceInDays(endDate, today);

  const handleUpgradeClick = async () => {
    setIsSending(true);
    try {
      await sendUpgradeRequestEmail({ user });
      toast({
        title: 'Solicitud Enviada',
        description: 'Hemos recibido tu solicitud de upgrade. Nos pondremos en contacto contigo pronto.',
      });
    } catch (error) {
      console.error("Error sending upgrade email:", error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la solicitud. Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (daysLeft < 0) {
    return (
       <div className="bg-destructive text-destructive-foreground text-center p-2 text-sm font-medium flex items-center justify-center gap-4">
        <AlertTriangle className="h-5 w-5" />
        <span>Tu período de prueba ha terminado. Para continuar, por favor actualiza tu plan.</span>
        <Button variant="secondary" size="sm" className="h-7" onClick={handleUpgradeClick} disabled={isSending}>
           {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
           {isSending ? 'Enviando...' : 'Hacer Upgrade'}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-yellow-100 border-b border-yellow-200 text-yellow-800 text-center p-2 text-sm font-medium flex items-center justify-center gap-4">
      <AlertTriangle className="h-5 w-5" />
      <span>Te quedan {daysLeft} día(s) de prueba.</span>
      <Button variant="default" size="sm" className="h-7 bg-primary hover:bg-primary/90" onClick={handleUpgradeClick} disabled={isSending}>
         {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
         {isSending ? 'Enviando...' : 'Hacer Upgrade'}
      </Button>
    </div>
  )

}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  const commonItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { href: "/contracts", label: "Contratos", icon: <FileText /> },
    { href: "/payments", label: "Pagos", icon: <CreditCard /> },
    { href: "/incidents", label: "Incidentes", icon: <ShieldAlert /> },
    { href: "/evaluations", label: "Evaluaciones", icon: <ClipboardCheck /> },
    { href: "/calendar", label: "Calendario", icon: <Calendar /> },
    { href: "/support", label: "Soporte", icon: <LifeBuoy /> },
  ];

  const landlordItems = [
    { href: "/properties", label: "Propiedades", icon: <Home /> },
    { href: "/legal-recovery", label: "Recuperación Legal", icon: <Scale /> },
  ];

  const tenantItems = [
     { href: "/report", label: "Informe", icon: <FileBadge /> },
  ];

  const menuItems = currentUser?.role === 'Arrendador' 
    ? [...commonItems, ...landlordItems] 
    : [...commonItems, ...tenantItems];

  if (loading || !currentUser) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <p className="text-muted-foreground">Cargando tu sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="p-2">
              <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className='p-2'>
              <UserNav />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background">
          {currentUser.subscriptionStatus === 'trialing' && (
              <TrialBanner user={currentUser} />
          )}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:justify-end">
            <SidebarTrigger className="sm:hidden" />
            <UserNav />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
