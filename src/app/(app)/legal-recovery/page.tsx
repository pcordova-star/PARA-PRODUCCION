
'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import LegalRecoveryClient from "./client";
import { Skeleton } from "@/components/ui/skeleton";

function LegalRecoveryPageContent() {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
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
        <LegalRecoveryPageContent />
    );
}
