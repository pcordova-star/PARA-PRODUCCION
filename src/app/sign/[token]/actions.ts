
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { Contract } from '@/types';

interface SignContractParams {
    contractId: string;
}

interface ActionResult {
    success: boolean;
    error?: string;
    contract?: Contract;
}

export async function signContractAction({ contractId }: SignContractParams): Promise<ActionResult> {
    const sessionCookie = cookies().get('session')?.value || '';
    if (!sessionCookie) {
        return { success: false, error: 'No has iniciado sesión.' };
    }

    let decodedClaims;
    try {
        decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        return { success: false, error: 'Tu sesión es inválida o ha expirado. Por favor, inicia sesión de nuevo.' };
    }
    
    const userId = decodedClaims.uid;
    const contractRef = adminDb.collection('contracts').doc(contractId);

    try {
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
            let isLandlordSigning = false;
            let isTenantSigning = false;

            if (userId === contract.tenantId) {
                if (contract.signedByTenant) throw new Error('Ya has firmado este contrato.');
                updatedData.signedByTenant = true;
                updatedData.tenantSignedAt = new Date().toISOString();
                isTenantSigning = true;
            } else if (userId === contract.landlordId) {
                if (contract.signedByLandlord) throw new Error('Ya has firmado este contrato.');
                updatedData.signedByLandlord = true;
                updatedData.landlordSignedAt = new Date().toISOString();
                isLandlordSigning = true;
            } else {
                throw new Error('No tienes permiso para firmar este contrato.');
            }

            // Check if both parties have now signed
            const landlordHasSigned = isLandlordSigning || contract.signedByLandlord;
            const tenantHasSigned = isTenantSigning || contract.signedByTenant;

            if (landlordHasSigned && tenantHasSigned) {
                updatedData.status = 'Activo';
            }
            
            transaction.update(contractRef, updatedData);

            return { ...contract, ...updatedData };
        });

        revalidatePath(`/contracts`);
        revalidatePath(`/sign/${result.signatureToken}`);

        return { success: true, contract: result };

    } catch (error: any) {
        console.error('Error in signContractAction:', error);
        return { success: false, error: error.message || 'Ocurrió un error al intentar firmar el contrato.' };
    }
}
