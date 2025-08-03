"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
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
}

const formatDate = (dateString: string) => {
    try {
      if (!dateString || !/^\d{4}-\d{2}-\d{2}/.test(dateString)) return "Fecha inválida";
      const [year, month, day] = dateString.split('T')[0].split('-');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return format(date, "d MMM yyyy", { locale: es });
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return "Fecha inválida";
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    }).format(amount);
};

export const columns = ({ onEdit, onDelete, userRole }: ColumnsConfig): ColumnDef<Contract>[] => [
  {
    accessorKey: "propertyAddress",
    header: "Propiedad",
  },
  {
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
                className = 'bg-green-500 hover:bg-green-600 text-white';
                break;
            case 'Borrador':
                 variant = 'outline';
                 className = 'border-yellow-500 text-yellow-600';
                break;
            case 'Finalizado':
                variant = 'secondary';
                break;
            case 'Cancelado':
                variant = 'destructive';
                break;
        }
        return <Badge variant={variant} className={className}>{status}</Badge>;
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
            <DropdownMenuItem>Ver Contrato</DropdownMenuItem>
            {userRole === 'Arrendador' && (
              <>
                <DropdownMenuItem onClick={() => onEdit(contract)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(contract)}>
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
