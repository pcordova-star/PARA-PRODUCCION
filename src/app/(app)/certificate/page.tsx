
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import TenantCertificateClient from "./client";


function CertificatePageContent() {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return <div>Cargando...</div>;
    }

    if (currentUser?.role !== 'Arrendatario') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>Esta sección solo está disponible para arrendatarios.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto">
            <TenantCertificateClient />
        </div>
    );
}

export default function TenantCertificatePage() {
    return (
        <AuthProvider>
            <CertificatePageContent />
        </AuthProvider>
    );
}
