'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertyFormDialog, type PropertyFormValues } from '@/components/properties/property-form-dialog';
import type { Property } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Propiedades</h1>
          <p className="text-muted-foreground">
            Aquí puede ver y gestionar sus propiedades.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Propiedad
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map(property => (
          <Card key={property.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="mb-1">{property.address}</CardTitle>
                    <CardDescription>{property.comuna}, {property.region}</CardDescription>
                  </div>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(property)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(property.id)}>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <Badge 
                variant={property.status === 'Disponible' ? 'default' : (property.status === 'Arrendada' ? 'secondary' : 'destructive')}
                className={property.status === 'Disponible' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                  {property.status}
              </Badge>
              <p className="font-semibold text-lg mt-2">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(property.price || 0)}
              </p>
              <p className="text-sm text-muted-foreground">{property.type}</p>
              <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                 <p>{property.bedrooms} hab. &middot; {property.bathrooms} baños &middot; {property.area} m²</p>
              </div>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">Código: {property.code}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
       <PropertyFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        property={selectedProperty}
        onSave={handleSaveProperty}
      />
    </div>
  );
}
