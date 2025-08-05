
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contract, Property } from '@/types';
import { ContractDisplay } from '@/components/legal/ContractDisplay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SignContractClient } from './client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignContractPage({ params }: { params: { token: string } }) {
    const { token } = params;
    const { currentUser, loading: authLoading } = useAuth();
    const router = useRouter();

    const [contract, setContract] = useState<Contract | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!token) {
            setError("El enlace de firma es inválido o ha expirado.");
            setLoading(false);
            return;
        }

        try {
            const contractsRef = collection(db, "contracts");
            const q = query(contractsRef, where("signatureToken", "==", token), limit(1));
            const contractSnapshot = await getDocs(q);

            if (contractSnapshot.empty) {
                setError("No se pudo encontrar un contrato asociado a este enlace.");
                setLoading(false);
                return;
            }

            const contractDoc = contractSnapshot.docs[0];
            const contractData = { ...contractDoc.data(), id: contractDoc.id } as Contract;
            setContract(contractData);

            const propertyDoc = await getDoc(doc(db, 'properties', contractData.propertyId));
            if (propertyDoc.exists()) {
                setProperty({ ...propertyDoc.data(), id: propertyDoc.id } as Property);
            } else {
                setError("No se pudo cargar la información de la propiedad asociada a este contrato.");
            }
        } catch (err) {
            console.error("Error fetching contract data:", err);
            setError("Ocurrió un error al cargar los datos del contrato.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push(`/login?redirect=/sign/${token}`);
        } else if (!authLoading && currentUser) {
            fetchData();
        }
    }, [authLoading, currentUser, router, token, fetchData]);

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Cargando sesión y contrato...</p>
                </div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (!contract || !property) {
        return (
             <div className="flex min-h-screen items-center justify-center p-4">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Cargando datos del contrato...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-muted min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="bg-card p-6 rounded-t-lg shadow-md border-b">
                    <h1 className="text-3xl font-bold text-primary">Firma de Contrato de Arrendamiento</h1>
                    <p className="text-muted-foreground mt-1">Revisa los términos del contrato y fírmalo digitalmente a continuación.</p>
                </header>
                <main className="bg-card p-6 rounded-b-lg shadow-md">
                   <SignContractClient contract={contract} />

                    <div className="mt-8">
                        <ContractDisplay contract={contract} property={property} />
                    </div>
                </main>
            </div>
        </div>
    );
}
