
'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Loader2 } from "lucide-react";
import TenantReportClient from "./client";

export default function TenantReportPage() {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (!currentUser) {
         return (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Cargando datos de usuario...</p>
            </div>
        );
    }

    if (currentUser.role !== 'Arrendatario') {
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
            <TenantReportClient />
        </div>
    );
}
