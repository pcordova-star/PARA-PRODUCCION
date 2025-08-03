
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import LegalRecoveryClient from "./client";

function LegalRecoveryPageContent() {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return <div>Cargando...</div>; 
    }

    if (currentUser?.role !== 'Arrendador') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>Esta sección solo está disponible para arrendadores.</AlertDescription>
            </Alert>
        );
    }
    
    return <LegalRecoveryClient />;
}


export default function LegalRecoveryPage() {
    return (
        <AuthProvider>
            <LegalRecoveryPageContent />
        </AuthProvider>
    );
}
