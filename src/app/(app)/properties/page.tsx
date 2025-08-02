
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, Upload, LayoutGrid, List, FileDown, Loader2 } from 'lucide-react';
import { PropertyFormDialog, type PropertyFormValues } from '@/components/properties/property-form-dialog';
import type { Property } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PropertiesDataTable } from '@/components/properties/properties-data-table';
import { columns } from '@/components/properties/properties-columns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PropertyCard } from '@/components/properties/property-card';
import Papa from 'papaparse';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const { toast } = useToast();

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const propertiesCollection = collection(db, 'properties');
      const propertiesSnapshot = await getDocs(propertiesCollection);
      const propertiesList = propertiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Property));
      setProperties(propertiesList);
    } catch (error) {
      console.error("Error fetching properties: ", error);
      toast({
        title: "Error al cargar propiedades",
        description: "No se pudieron obtener los datos de Firestore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSaveProperty = async (values: PropertyFormValues, isEditing: boolean, originalPropertyId?: string) => {
    setIsSubmitting(true);
    try {
      if (isEditing && originalPropertyId) {
        const propertyRef = doc(db, 'properties', originalPropertyId);
        await updateDoc(propertyRef, values);
        toast({ title: 'Propiedad actualizada', description: 'Los cambios se han guardado con éxito.' });
      } else {
        const newPropertyData = {
          ...values,
          status: 'Disponible' as const,
        };
        await addDoc(collection(db, 'properties'), newPropertyData);
        toast({ title: 'Propiedad añadida', description: 'La nueva propiedad ha sido creada.' });
      }
      fetchProperties(); // Re-fetch data to update the UI
      setIsFormOpen(false);
      setSelectedProperty(null);
    } catch (error) {
       console.error("Error saving property:", error);
       toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar la propiedad. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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

  const openDeleteDialog = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
        await deleteDoc(doc(db, 'properties', propertyToDelete.id));
        toast({ title: 'Propiedad eliminada', description: `La propiedad en ${propertyToDelete.address} ha sido eliminada.`, variant: 'destructive' });
        fetchProperties(); // Re-fetch data
        setIsDeleteDialogOpen(false);
        setPropertyToDelete(null);
    } catch (error) {
        console.error("Error deleting property:", error);
        toast({
            title: 'Error al eliminar',
            description: 'No se pudo eliminar la propiedad. Inténtalo de nuevo.',
            variant: 'destructive',
        });
    }
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

  const handleExport = () => {
    const dataToExport = properties.map(p => ({
      Codigo: p.code,
      Direccion: p.address,
      Comuna: p.comuna,
      Region: p.region,
      Tipo: p.type,
      Precio: p.price,
      Area_m2: p.area,
      Dormitorios: p.bedrooms,
      Banos: p.bathrooms,
      RUT_Propietario: p.ownerRut,
      Estado: p.status,
      Descripcion: p.description,
    }));
    
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sara_propiedades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportación exitosa', description: 'El archivo de propiedades ha sido descargado.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Propiedades</h1>
          <p className="text-muted-foreground">
            Aquí puede ver y gestionar sus propiedades.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={() => setViewMode('cards')} disabled={viewMode === 'cards'}>
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Vista de Tarjetas</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode('list')} disabled={viewMode === 'list'}>
              <List className="h-4 w-4" />
              <span className="sr-only">Vista de Lista</span>
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
            </Button>
            <Button variant="outline" onClick={handleBulkUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Carga Masiva
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Plantilla
            </Button>
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir
            </Button>
        </div>
      </div>

       {loading ? (
          <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
              </div>
          </div>
       ) : viewMode === 'cards' ? (
          properties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {properties.map(property => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onEdit={() => handleEdit(property)} 
                      onDelete={() => openDeleteDialog(property)} 
                    />
                ))}
            </div>
          ) : (
             <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-medium">No hay propiedades</h3>
                <p className="text-muted-foreground mt-1">Añada su primera propiedad para comenzar.</p>
            </div>
          )
       ) : (
          <PropertiesDataTable 
            columns={columns({ onEdit: handleEdit, onDelete: openDeleteDialog })} 
            data={properties} 
          />
       )}


       <PropertyFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        property={selectedProperty}
        onSave={handleSaveProperty}
        isSubmitting={isSubmitting}
      />
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar esta propiedad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la propiedad de sus registros.
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

    