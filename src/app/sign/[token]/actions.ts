
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { Contract, UserRole } from '@/types';

interface SignContractParams {
    contractId: string;
    signerRole: 'tenant' | 'landlord';
}

interface ActionResult {
    success: boolean;
    error?: string;
    contract?: Contract;
}

export async function signContractAction({ contractId, signerRole }: SignContractParams): Promise<ActionResult> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) {
            return { success: false, error: 'Sesión no encontrada. Por favor, inicia sesión de nuevo.' };
        }

        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userId = decodedClaims.uid;
        
        const contractRef = adminDb.collection('contracts').doc(contractId);

        const result = await adminDb.runTransaction(async (transaction) => {
            const contractDoc = await transaction.get(contractRef);
            if (!contractDoc.exists) {
                throw new Error('El contrato no existe.');
            }

            const contract = { ...contractDoc.data(), id: contractDoc.id } as Contract;

            if (contract.status !== 'Borrador') {
                throw new Error('Este contrato ya no está en estado de borrador y no puede ser firmado.');
            }

            let updatedData: Partial<Contract> = {};

            if (signerRole === 'tenant' && userId === contract.tenantId) {
                if (contract.signedByTenant) throw new Error('Ya has firmado este contrato.');
                updatedData.signedByTenant = true;
                updatedData.tenantSignedAt = new Date().toISOString();
            } else if (signerRole === 'landlord' && userId === contract.landlordId) {
                if (!contract.signedByTenant) {
                    throw new Error('El arrendatario debe firmar el contrato antes que el arrendador.');
                }
                if (contract.signedByLandlord) throw new Error('Ya has firmado este contrato.');
                updatedData.signedByLandlord = true;
                updatedData.landlordSignedAt = new Date().toISOString();
            } else {
                throw new Error('No tienes permiso para firmar este contrato.');
            }
            
            const isTenantSigned = signerRole === 'tenant' || contract.signedByTenant;
            const isLandlordSigned = signerRole === 'landlord' || contract.signedByLandlord;

            if (isTenantSigned && isLandlordSigned) {
                updatedData.status = 'Activo';
                const propertyRef = adminDb.collection('properties').doc(contract.propertyId);
                transaction.update(propertyRef, { status: 'Arrendada' });
            }
            
            transaction.update(contractRef, updatedData);

            return { ...contract, ...updatedData };
        });

        revalidatePath(`/contracts`);
        revalidatePath(`/sign/${result.signatureToken}`);

        return { success: true, contract: result };

    } catch (error: any) {
        console.error('Error in signContractAction:', error);
        
        if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/invalid-session-cookie') {
             return { success: false, error: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo para firmar.' };
        }
        
        return { success: false, error: error.message || 'Ocurrió un error al intentar firmar el contrato.' };
    }
}
