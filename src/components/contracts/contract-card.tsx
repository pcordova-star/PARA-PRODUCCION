
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contract, UserRole } from "@/types";
import { Calendar, User, Home, Pencil, Trash2, CheckCircle, XCircle, Building, FileSliders, CircleDollarSign, Eye, PenSquare, Send } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ContractCardProps {
    contract: Contract;
    userRole: UserRole;
    onEdit: () => void;
    onDelete: () => void;
    onSign: () => void;
    onViewDetails: () => void;
    onResend: () => void;
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
        case 'Archivado':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return "N/A";
    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
        if (isNaN(date.getTime())) {
            return "Fecha Inválida";
        }
        return format(date, "d MMM yyyy", { locale: es });
    } catch (error) {
        return "Fecha Inválida";
    }
};


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    }).format(amount);
};

export function ContractCard({ contract, userRole, onEdit, onDelete, onSign, onViewDetails, onResend }: ContractCardProps) {

    const SignatureStatus = () => {
        if (contract.status !== 'Borrador') return null;

        const landlordSigned = contract.signedByLandlord;
        const tenantSigned = contract.signedByTenant;
        let text = "";
        let colorClass = "";

        if (landlordSigned && tenantSigned) { // This case should not happen if status becomes Active
            text = "Ambos han firmado";
            colorClass = "text-green-600";
        } else if (landlordSigned) { // This case should not happen based on new flow
            text = "Esperando firma del arrendatario";
            colorClass = "text-yellow-600";
        } else if (tenantSigned) {
            text = userRole === 'Arrendador' ? "Listo para tu firma" : "Esperando firma del arrendador";
            colorClass = "text-blue-600";
        } else {
            text = "Pendiente de firma del arrendatario";
            colorClass = "text-muted-foreground";
        }

        return <p className={`text-xs font-medium mt-2 ${colorClass}`}>{text}</p>;
    };

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
                <SignatureStatus />
            </CardHeader>
            <CardContent className="flex-grow space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Home className="h-5 w-5 shrink-0" />
                    <span className="truncate">{contract.propertyAddress}</span>
                </div>
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="h-5 w-5 shrink-0" />
                    <span className="truncate">{userRole === 'Arrendador' ? `Arrendatario: ${contract.tenantName}` : `Arrendador: ${contract.landlordName}`}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground pt-2">
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
                {userRole === 'Arrendatario' && contract.status === 'Borrador' && !contract.signedByTenant && (
                    <Button asChild size="sm" className="flex-1">
                        <a href={`/sign/${contract.signatureToken}`} target="_blank">Revisar y Firmar</a>
                    </Button>
                )}
                 {userRole === 'Arrendador' && contract.status !== 'Finalizado' && contract.status !== 'Archivado' && (
                    <>
                        <Button variant="outline" size="sm" onClick={onViewDetails}>
                           <Eye className="mr-2 h-4 w-4" /> Ver
                        </Button>
                        {contract.status === 'Borrador' && contract.signedByTenant && !contract.signedByLandlord && (
                            <Button size="sm" onClick={onSign}>
                                <PenSquare className="mr-2 h-4 w-4" /> Firmar para Activar
                            </Button>
                        )}
                         {contract.status === 'Borrador' && (
                            <Button variant="outline" size="sm" onClick={onResend}>
                                <Send className="mr-2 h-4 w-4" /> Reenviar
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar" disabled={contract.status !== 'Borrador'}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete} aria-label="Eliminar">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                )}
                 {userRole === 'Arrendatario' && contract.status !== 'Borrador' && (
                     <Button variant="outline" size="sm" onClick={onViewDetails}>
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                     </Button>
                 )}
            </CardFooter>
        </Card>
    );
}
