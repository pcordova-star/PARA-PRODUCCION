'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, Upload } from 'lucide-react';
import { PropertyFormDialog, type PropertyFormValues } from '@/components/properties/property-form-dialog';
import type { Property } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { PropertiesDataTable } from '@/components/properties/properties-data-table';
import { columns } from '@/components/properties/properties-columns';

const initialProperties: Property[] = [
  {
    id: '1',
    code: 'PRO-001',
    address: 'Av. Providencia 123',
    comuna: 'Providencia',
    region: 'Metropolitana de Santiago',
    status: 'Disponible',
    price: 500000,
    type: 'Departamento',
    ownerRut: '12.345.678-9',
    area: 50,
    bedrooms: 2,
    bathrooms: 1,
    description: 'Acogedor departamento en el corazón de Providencia.'
  },
  {
    id: '2',
    code: 'PRO-002',
    address: 'Calle Falsa 123',
    comuna: 'Las Condes',
    region: 'Metropolitana de Santiago',
    status: 'Arrendada',
    price: 1200000,
    type: 'Casa',
    ownerRut: '98.765.432-1',
    area: 200,
    bedrooms: 4,
    bathrooms: 3,
    description: 'Amplia casa con jardín y piscina.'
  },
    {
    id: '3',
    code: 'PRO-003',
    address: 'El Roble 456',
    comuna: 'Ñuñoa',
    region: 'Metropolitana de Santiago',
    status: 'Mantenimiento',
    price: 750000,
    type: 'Departamento',
    ownerRut: '11.222.333-4',
    area: 80,
    bedrooms: 3,
    bathrooms: 2,
    description: 'Departamento remodelado cerca de la plaza.'
  },
];


export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  const handleSaveProperty = (values: PropertyFormValues, isEditing: boolean, originalPropertyId?: string) => {
    try {
      if (isEditing && originalPropertyId) {
        setProperties(prev =>
          prev.map(p =>
            p.id === originalPropertyId ? { ...p, ...values, id: originalPropertyId } : p
          )
        );
        toast({ title: 'Propiedad actualizada', description: 'Los cambios se han guardado con éxito.' });
      } else {
        const newProperty: Property = {
          ...values,
          id: uuidv4(),
          code: values.code || uuidv4().slice(0, 8).toUpperCase(),
          status: 'Disponible',
        };
        setProperties(prev => [newProperty, ...prev]);
        toast({ title: 'Propiedad añadida', description: 'La nueva propiedad ha sido creada.' });
      }
      setIsFormOpen(false);
      setSelectedProperty(null);
    } catch (error) {
       toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar la propiedad. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAddNew = () => {
    setSelectedProperty(null);
    setIsFormOpen(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    toast({ title: 'Propiedad eliminada', description: 'La propiedad ha sido eliminada con éxito.', variant: 'destructive' });
  };
  
  const handleDownloadTemplate = () => {
    const header = "Codigo,RUTPropietario,Region,Comuna,Direccion,Tipo,PrecioCLP,AreaM2,Dormitorios,Banos,Descripcion\n";
    const exampleRow = "PRO-004,11.222.333-K,Valparaíso,Viña del Mar,Av. Marina 57,Departamento,550000,75,2,2,Departamento con vista al mar";
    const csvContent = "data:text/csv;charset=utf-8," + header + exampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_propiedades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Plantilla descargada', description: 'El archivo de plantilla CSV ha sido descargado.' });
  }
  
  const handleBulkUpload = () => {
      toast({ title: 'Función no implementada', description: 'La carga masiva de propiedades estará disponible próximamente.' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Propiedades</h1>
          <p className="text-muted-foreground">
            Aquí puede ver y gestionar sus propiedades.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBulkUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Carga Masiva
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla
            </Button>
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Propiedad
            </Button>
        </div>
      </div>

       <PropertiesDataTable 
        columns={columns({ onEdit: handleEdit, onDelete: handleDelete })} 
        data={properties} 
       />

       <PropertyFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        property={selectedProperty}
        onSave={handleSaveProperty}
      />
    </div>
  );
}
