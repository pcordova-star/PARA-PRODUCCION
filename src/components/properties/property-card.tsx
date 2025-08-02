
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/types";
import { BedDouble, Bath, Ruler, Pencil, Trash2 } from "lucide-react";

interface PropertyCardProps {
    property: Property;
    onEdit: () => void;
    onDelete: () => void;
}

const getStatusBadgeVariant = (status: Property["status"]) => {
    switch (status) {
        case 'Disponible':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Arrendada':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Mantenimiento':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "No especificado";
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    }).format(amount);
};

export function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
    return (
        <Card className="flex h-full flex-col shadow-md transition-shadow duration-200 hover:shadow-lg">
            <CardHeader className="pb-4">
                 <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{property.type} en {property.comuna}</CardTitle>
                    <Badge className={`${getStatusBadgeVariant(property.status)} capitalize text-xs font-semibold`}>{property.status}</Badge>
                </div>
                <CardDescription className="pt-1">{property.address}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="text-2xl font-bold text-primary">{formatCurrency(property.price)}</div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        <span>{property.bedrooms ?? 'N/A'}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms ?? 'N/A'}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        <span>{property.area ? `${property.area} m²` : 'N/A'}</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete} aria-label="Eliminar">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
