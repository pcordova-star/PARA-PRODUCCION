
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contract, UserRole } from "@/types";
import { Calendar, User, Home, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ContractCardProps {
    contract: Contract;
    userRole: UserRole;
    onEdit: () => void;
    onDelete: () => void;
    onUpdateStatus: (status: 'Activo' | 'Cancelado') => void;
}

const getStatusBadgeVariant = (status: Contract["status"]) => {
    switch (status) {
        case 'Activo':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Borrador':
             return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Finalizado':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'Cancelado':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Fecha Indefinida";
    try {
        // Assuming dateString is in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
        const date = new Date(dateString);
        // Correct for timezone offset if necessary, but format should handle it
        return format(date, "d MMM yyyy", { locale: es });
    } catch {
        return "Fecha inválida";
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    }).format(amount);
};

export function ContractCard({ contract, userRole, onEdit, onDelete, onUpdateStatus }: ContractCardProps) {
    return (
        <Card className="flex h-full flex-col shadow-md transition-shadow duration-200 hover:shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Contrato {contract.propertyName}</CardTitle>
                    <Badge className={`${getStatusBadgeVariant(contract.status)} capitalize text-xs font-semibold`}>{contract.status}</Badge>
                </div>
                <CardDescription className="pt-1 text-2xl font-bold text-primary">
                    {formatCurrency(contract.rentAmount)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Home className="h-5 w-5 shrink-0" />
                    <span className="truncate">{contract.propertyAddress}</span>
                </div>
                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <User className="h-5 w-5 shrink-0" />
                    <span className="truncate">{userRole === 'Arrendador' ? `Arrendatario: ${contract.tenantName}` : `Arrendador: ${contract.landlordName}`}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(contract.startDate)}</span>
                    </div>
                     <span className="mx-2">-</span>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(contract.endDate)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {userRole === 'Arrendatario' && contract.status === 'Borrador' && (
                    <div className="flex w-full justify-between gap-2">
                        <Button variant="outline" size="sm" className="flex-1 border-red-500 text-red-500 hover:bg-red-50" onClick={() => onUpdateStatus('Cancelado')}>
                            <XCircle className="mr-2 h-4 w-4" /> Rechazar
                        </Button>
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus('Activo')}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Aprobar
                        </Button>
                    </div>
                )}
                 {userRole === 'Arrendador' && contract.status !== 'Finalizado' && (
                    <>
                        <Button variant="outline" size="sm">Ver</Button>
                        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar" disabled={contract.status !== 'Borrador'}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete} aria-label="Eliminar">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
