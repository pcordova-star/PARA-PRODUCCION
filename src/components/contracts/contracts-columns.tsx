
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, CheckCircle, XCircle, Pencil, Trash2, Eye, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Contract, UserRole } from "@/types"
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type ColumnsConfig = {
    onEdit: (contract: Contract) => void;
    onDelete: (contract: Contract) => void;
    userRole: UserRole;
    onSign: (contract: Contract) => void;
    onViewDetails: (contract: Contract) => void;
}

const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return "N/A";
    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
        if (date instanceof Date && !isNaN(date.getTime())) {
            return format(date, "d MMM yyyy", { locale: es });
        }
        return "Fecha Inválida";
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return "Fecha inválida";
    }
};


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    }).format(amount);
};

export const columns = ({ onEdit, onDelete, userRole, onSign, onViewDetails }: ColumnsConfig): ColumnDef<Contract>[] => [
  {
    accessorKey: "propertyAddress",
    header: "Propiedad",
  },
  {
    id: 'user-role-specific-name', // Static ID for filtering
    accessorKey: userRole === 'Arrendador' ? "tenantName" : "landlordName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {userRole === 'Arrendador' ? 'Arrendatario' : 'Arrendador'}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: "Inicio",
    cell: ({ row }) => formatDate(row.getValue("startDate")),
  },
  {
    accessorKey: "endDate",
    header: "Fin",
    cell: ({ row }) => formatDate(row.getValue("endDate")),
  },
  {
    accessorKey: "rentAmount",
    header: () => <div className="text-right">Monto (CLP)</div>,
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("rentAmount"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
        let className = '';

        switch (status) {
            case 'Activo':
                variant = 'default';
                className = 'bg-green-100 text-green-800 border-green-200';
                break;
            case 'Borrador':
                 variant = 'outline';
                 className = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                break;
            case 'Finalizado':
                variant = 'secondary';
                break;
            case 'Cancelado':
                variant = 'destructive';
                className = 'bg-red-100 text-red-800 border-red-200';
                break;
            case 'Archivado':
                variant = 'outline';
                className = 'bg-orange-100 text-orange-800 border-orange-200';
                break;
        }
        return <Badge variant={variant} className={`${className} capitalize`}>{status}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contract = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(contract)}>
                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
            </DropdownMenuItem>
            
            {userRole === 'Arrendador' && contract.status === 'Borrador' && contract.signedByTenant && !contract.signedByLandlord && (
              <DropdownMenuItem onClick={() => onSign(contract)}>
                  <PenSquare className="mr-2 h-4 w-4" /> Firmar para Activar
              </DropdownMenuItem>
            )}

            {userRole === 'Arrendador' && contract.status !== 'Archivado' && (
              <>
                <DropdownMenuItem onClick={() => onEdit(contract)} disabled={contract.status !== 'Borrador'}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(contract)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Archivar
                </DropdownMenuItem>
              </>
            )}

          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
