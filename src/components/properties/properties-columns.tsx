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
import type { Property } from "@/types"

type ColumnsConfig = {
    onEdit: (property: Property) => void;
    onDelete: (property: Property) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnsConfig): ColumnDef<Property>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Código
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "address",
    header: "Dirección",
  },
  {
    accessorKey: "comuna",
    header: "Comuna",
  },
  {
    accessorKey: "type",
    header: "Tipo",
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Precio (CLP)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'Disponible' ? 'default' : (status === 'Arrendada' ? 'secondary' : 'destructive');
        const className = status === 'Disponible' ? 'bg-green-500 hover:bg-green-600 text-white' : ''
        return <Badge variant={variant} className={className}>{status}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const property = row.original

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
            <DropdownMenuItem onClick={() => onEdit(property)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(property)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
