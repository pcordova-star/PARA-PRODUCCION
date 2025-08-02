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
import { Home, FileText, CreditCard, ShieldAlert, Scale, LayoutDashboard, LogOut, ClipboardCheck, Calendar, FileBadge } from 'lucide-react';

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="m2 10.45 10-9 10 9"/></svg>
       <h1 className="text-xl font-bold text-foreground">S.A.R.A</h1>
    </Link>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { href: "/properties", label: "Propiedades", icon: <Home /> },
    { href: "/contracts", label: "Contratos", icon: <FileText /> },
    { href: "/payments", label: "Pagos", icon: <CreditCard /> },
    { href: "/incidents", label: "Incidentes", icon: <ShieldAlert /> },
    { href: "/evaluations", label: "Evaluaciones", icon: <ClipboardCheck /> },
    { href: "/calendar", label: "Calendario", icon: <Calendar /> },
    { href: "/legal-recovery", label: "Recuperación Legal", icon: <Scale /> },
    { href: "/certificate", label: "Certificado", icon: <FileBadge /> },
  ];

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
              <SidebarMenuButton asChild>
                <Link href="/login">
                    <LogOut />
                    <span>Cerrar Sesión</span>
                </Link>
              </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background">
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
