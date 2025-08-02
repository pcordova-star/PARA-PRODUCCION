'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ContractFormDialog } from '@/components/contracts/contract-form-dialog';
import type { Contract, Property } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { ContractsDataTable } from '@/components/contracts/contracts-data-table';
import { columns } from '@/components/contracts/contracts-columns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


// Mock data - En una aplicación real, esto vendría de una API
const initialContracts: Contract[] = [
  {
    id: 'CTR-001',
    propertyId: '1',
    propertyAddress: 'Av. Providencia 123',
    tenantName: 'Juan Pérez',
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2024-01-14T00:00:00Z',
    rentAmount: 500000,
    status: 'Activo',
    propertyUsage: 'Habitacional',
    tenantEmail: 'juan.perez@email.com',
    tenantRut: '11.111.111-1',
  },
  {
    id: 'CTR-002',
    propertyId: '2',
    propertyAddress: 'Calle Falsa 123',
    tenantName: 'Ana García',
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2025-02-28T00:00:00Z',
    rentAmount: 1200000,
    status: 'Finalizado',
    propertyUsage: 'Habitacional',
    tenantEmail: 'ana.garcia@email.com',
    tenantRut: '22.222.222-2',
  },
];

const userProperties: Property[] = [
    { id: '1', address: 'Av. Providencia 123', code: 'PRO-001', comuna: 'Providencia', region: 'Metropolitana de Santiago', status: 'Arrendada', type: 'Departamento', description: 'desc' },
    { id: '2', address: 'Calle Falsa 123', code: 'PRO-002', comuna: 'Las Condes', region: 'Metropolitana de Santiago', status: 'Arrendada', type: 'Casa', description: 'desc' },
    { id: '3', address: 'El Roble 456', code: 'PRO-003', comuna: 'Ñuñoa', region: 'Metropolitana de Santiago', status: 'Disponible', type: 'Departamento', description: 'desc' },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const { toast } = useToast();

  const handleSaveContract = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Simular una llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const property = userProperties.find(p => p.id === values.propertyId);
      if (!property) {
          throw new Error("Property not found");
      }

      if (selectedContract) {
        // Editar
        setContracts(prev =>
          prev.map(c =>
            c.id === selectedContract.id
              ? { ...c, ...values, propertyAddress: property.address, id: selectedContract.id, status: c.status }
              : c
          )
        );
        toast({ title: 'Contrato actualizado', description: 'Los cambios se han guardado con éxito.' });
      } else {
        // Crear
        const newContract: Contract = {
          ...values,
          id: uuidv4(),
          propertyAddress: property.address,
          status: 'Borrador',
        };
        setContracts(prev => [newContract, ...prev]);
        toast({ title: 'Contrato creado', description: 'El nuevo contrato está en estado Borrador.' });
      }
      setIsFormOpen(false);
      setSelectedContract(null);
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar el contrato. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddNew = () => {
    setSelectedContract(null);
    setIsFormOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (!contractToDelete) return;
    setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
    toast({ title: 'Contrato eliminado', description: `El contrato con ${contractToDelete.tenantName} ha sido eliminado.`, variant: 'destructive' });
    setIsDeleteDialogOpen(false);
    setContractToDelete(null);
  };
  
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Contratos</h1>
          <p className="text-muted-foreground">
            Cree, envíe y administre sus contratos de arriendo.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Contrato
            </Button>
        </div>
      </div>

       <ContractsDataTable 
        columns={columns({ onEdit: handleEdit, onDelete: openDeleteDialog })} 
        data={contracts} 
       />

       <ContractFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contract={selectedContract}
        onSave={handleSaveContract}
        userProperties={userProperties.filter(p => p.status !== 'Arrendada' || p.id === selectedContract?.propertyId)}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar este contrato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el contrato de sus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
