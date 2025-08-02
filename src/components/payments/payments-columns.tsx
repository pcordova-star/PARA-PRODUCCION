"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle2, MoreHorizontal } from "lucide-react"
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
import type { Payment, UserRole } from "@/types"

type ColumnsConfig = {
    onAccept: (payment: Payment) => void;
    currentUserRole: UserRole;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    }).format(amount);
};

export const columns = ({ onAccept, currentUserRole }: ColumnsConfig): ColumnDef<Payment>[] => [
  {
    accessorKey: "propertyName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Propiedad
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "tenantName",
    header: "Arrendatario",
  },
  {
    accessorKey: "paymentDate",
    header: "Fecha de Pago",
    cell: ({ row }) => formatDate(row.getValue("paymentDate")),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Monto (CLP)</div>,
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("amount"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
        let className = '';

        switch (status) {
            case 'aceptado':
                variant = 'default';
                className = 'bg-green-100 text-green-800 border-green-200';
                break;
            case 'pendiente':
                 variant = 'outline';
                 className = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                break;
        }
        return <Badge variant={variant} className={className}>{status}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

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
            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
             {currentUserRole === 'Arrendador' && payment.status === 'pendiente' && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-green-600 focus:text-green-700 focus:bg-green-50"
                        onClick={() => onAccept(payment)}
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Aceptar Pago
                    </DropdownMenuItem>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
