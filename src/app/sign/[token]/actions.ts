
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { Contract } from '@/types';

interface SignContractParams {
    contractId: string;
    signerId: string;
}

interface ActionResult {
    success: boolean;
    error?: string;
    contract?: Contract;
}

export async function signContractAction({ contractId, signerId }: SignContractParams): Promise<ActionResult> {
    try {
        if (!signerId) {
            return { success: false, error: 'Usuario no identificado. Por favor, inicia sesión de nuevo.' };
        }
        
        const contractRef = adminDb.collection('contracts').doc(contractId);

        const result = await adminDb.runTransaction(async (transaction) => {
            const contractDoc = await transaction.get(contractRef);
            if (!contractDoc.exists) {
                throw new Error('El contrato no existe.');
            }

            const contract = { ...contractDoc.data(), id: contractDoc.id } as Contract;
            const signerRole = signerId === contract.landlordId ? 'landlord' : 'tenant';

            if (contract.status !== 'Borrador') {
                throw new Error('Este contrato ya no está en estado de borrador y no puede ser firmado.');
            }

            let updatedData: Partial<Contract> = {};

            if (signerRole === 'tenant' && (signerId === contract.tenantId || !contract.tenantId)) {
                if (contract.signedByTenant) throw new Error('Ya has firmado este contrato.');
                updatedData.signedByTenant = true;
                updatedData.tenantSignedAt = new Date().toISOString();
                if (!contract.tenantId) {
                    updatedData.tenantId = signerId;
                }
            } else if (signerRole === 'landlord' && signerId === contract.landlordId) {
                if (!contract.signedByTenant) {
                    throw new Error('El arrendatario debe firmar el contrato antes que el arrendador.');
                }
                if (contract.signedByLandlord) throw new Error('Ya has firmado este contrato.');
                updatedData.signedByLandlord = true;
                updatedData.landlordSignedAt = new Date().toISOString();
            } else {
                throw new Error('No tienes permiso para firmar este contrato.');
            }
            
            const isTenantSigned = updatedData.signedByTenant || contract.signedByTenant;
            const isLandlordSigned = updatedData.signedByLandlord || contract.signedByLandlord;

            if (isTenantSigned && isLandlordSigned) {
                updatedData.status = 'Activo';
                const propertyRef = adminDb.collection('properties').doc(contract.propertyId);
                transaction.update(propertyRef, { status: 'Arrendada' });
            }
            
            transaction.update(contractRef, updatedData);

            return { ...contract, ...updatedData };
        });

        revalidatePath(`/contracts`);
        if (result.signatureToken) {
            revalidatePath(`/sign/${result.signatureToken}`);
        }

        return { success: true, contract: result };

    } catch (error: any) {
        console.error('Error in signContractAction:', error);
        return { success: false, error: error.message || 'Ocurrió un error al intentar firmar el contrato.' };
    }
}

