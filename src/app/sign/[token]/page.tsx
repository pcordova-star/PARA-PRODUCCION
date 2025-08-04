
"use server";

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contract, Property } from '@/types';
import { ContractDisplay } from '@/components/legal/ContractDisplay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SignContractClient } from './client';

async function getContractByToken(token: string): Promise<Contract | null> {
    const contractsRef = collection(db, "contracts");
    const q = query(contractsRef, where("signatureToken", "==", token), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return null;
    }
    
    const contractDoc = snapshot.docs[0];
    return { ...contractDoc.data(), id: contractDoc.id } as Contract;
}

async function getPropertyById(propertyId: string): Promise<Property | null> {
    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
    if (propertyDoc.exists()) {
        return { ...propertyDoc.data(), id: propertyDoc.id } as Property;
    }
    return null;
}

export default async function SignContractPage({ params }: { params: { token: string } }) {
    const { token } = params;

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error: Token Inválido</AlertTitle>
                    <AlertDescription>El enlace de firma es inválido o ha expirado.</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const contract = await getContractByToken(token);

    if (!contract) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Contrato No Encontrado</AlertTitle>
                    <AlertDescription>No se pudo encontrar un contrato asociado a este enlace. Puede que ya haya sido firmado o eliminado.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const property = await getPropertyById(contract.propertyId);

    if (!property) {
         return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de Datos</AlertTitle>
                    <AlertDescription>No se pudo cargar la información de la propiedad asociada a este contrato.</AlertDescription>
                </Alert>
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
