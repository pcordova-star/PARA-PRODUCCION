
import { Logo } from '@/components/logo';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Logo />
        </div>
      </header>
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card p-8 md:p-12 rounded-lg shadow-md">
            {children}
          </div>
        </div>
      </main>
      <footer className="bg-card border-t">
        <div className="container mx-auto flex items-center justify-center px-4 py-6 md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} S.A.R.A. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
