
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Contract } from '@/types';
import { signContractAction } from './actions';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface SignContractClientProps {
    contract: Contract;
}

export function SignContractClient({ contract: initialContract }: SignContractClientProps) {
    const [contract, setContract] = useState(initialContract);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { currentUser, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setContract(initialContract);
    }, [initialContract]);


    const handleSign = async () => {
        if (!currentUser) {
            setError("Debes iniciar sesión para poder firmar.");
            return;
        }
        setIsLoading(true);
        setError(null);
        
        const result = await signContractAction({ 
            contractId: contract.id,
            signerId: currentUser.uid,
        });

        if (result.error) {
            setError(result.error);
            toast({
                title: 'Error al firmar',
                description: result.error,
                variant: 'destructive',
            });
        } else if (result.success && result.contract) {
            setContract(result.contract);
            toast({
                title: '¡Contrato Firmado!',
                description: 'Tu firma ha sido registrada exitosamente.',
            });
            router.refresh();
        }
        setIsLoading(false);
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center p-6 bg-muted rounded-md">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="ml-2">Verificando tu identidad...</p>
            </div>
        );
    }

    // This is the gatekeeper. No currentUser means no access. The page.tsx handles redirection.
    if (!currentUser) {
        return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acción Requerida</AlertTitle>
                <AlertDescription>
                    Por favor, inicia sesión para continuar con el proceso de firma.
                </AlertDescription>
            </Alert>
        );
    }
    
    // Permission logic
    const isLandlord = currentUser.uid === contract.landlordId;
    const isTenant = currentUser.uid === contract.tenantId;
    const isTenantByEmail = currentUser.email?.toLowerCase() === contract.tenantEmail?.toLowerCase() && !contract.tenantId;

    if (!isLandlord && !isTenant && !isTenantByEmail) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>
                    No tienes permiso para ver o firmar este contrato. Verifica que has iniciado sesión con la cuenta correcta.
                </AlertDescription>
            </Alert>
        );
    }

    if (contract.status !== 'Borrador') {
        return (
            <Alert variant="default">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Contrato ya no está en Borrador</AlertTitle>
                <AlertDescription>
                    Este contrato ya ha sido activado o cancelado. Estado actual: <Badge>{contract.status}</Badge>
                </AlertDescription>
                 <Button asChild className="mt-4"><Link href="/dashboard">Ir al Panel</Link></Button>
            </Alert>
        );
    }

    if (isTenant || isTenantByEmail) {
        if (contract.signedByTenant) {
             return (
                <div className="text-center p-6 bg-muted rounded-lg border">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h2 className="text-xl font-bold">¡Gracias por firmar!</h2>
                    <p className="text-muted-foreground">Tu firma fue registrada el {new Date(contract.tenantSignedAt!).toLocaleString('es-CL')}.</p>
                    <p className="mt-2">El contrato se activará una vez que el arrendador también lo haya firmado.</p>
                    <Button asChild className="mt-4"><Link href="/dashboard">Volver al Panel</Link></Button>
                </div>
            );
        } else {
             return (
                <div className="space-y-4 p-6 bg-muted rounded-lg border">
                    <div className="text-center">
                        <h2 className="text-xl font-bold">Confirmación de Firma (Arrendatario)</h2>
                        <p className="text-muted-foreground mt-1">
                            Al presionar "Firmar Contrato", confirmas que has leído, entendido y aceptado todos los términos y condiciones del documento a continuación.
                        </p>
                        <Button onClick={handleSign} disabled={isLoading} size="lg" className="mt-4">
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isLoading ? 'Firmando...' : 'Firmar Contrato'}
                        </Button>
                        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    </div>
                </div>
            );
        }
    }

    if (isLandlord) {
        if (contract.signedByLandlord) {
            return (
                 <div className="text-center p-6 bg-muted rounded-lg border">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h2 className="text-xl font-bold">Firma Registrada</h2>
                    <p className="text-muted-foreground">Ya has firmado este contrato.</p>
                    <Button asChild className="mt-4"><Link href="/dashboard">Volver al Panel</Link></Button>
                </div>
            )
        }
        if (!contract.signedByTenant) {
            return (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Esperando al Arrendatario</AlertTitle>
                    <AlertDescription>
                       El contrato aún no ha sido firmado por el arrendatario. Recibirás una notificación cuando esté listo para tu firma.
                    </AlertDescription>
                </Alert>
            )
        } else {
             return (
                <div className="space-y-4 p-6 bg-muted rounded-lg border">
                    <div className="text-center">
                        <h2 className="text-xl font-bold">Confirmación de Firma (Arrendador)</h2>
                        <p className="text-muted-foreground mt-1">
                           El arrendatario ha firmado. Al firmar, el contrato pasará a estado "Activo".
                        </p>
                        <Button onClick={handleSign} disabled={isLoading} size="lg" className="mt-4">
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isLoading ? 'Activando...' : 'Firmar y Activar Contrato'}
                        </Button>
                        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    </div>
                </div>
            );
        }
    }

    return null;
}
