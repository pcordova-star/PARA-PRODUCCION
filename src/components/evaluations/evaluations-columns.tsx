"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, CheckSquare, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Evaluation, UserRole } from "@/types"

type ColumnsConfig = {
    userRole: UserRole;
    onConfirm?: (evaluation: Evaluation) => void;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
};

const getStatusBadgeVariant = (status: Evaluation["status"]) => {
    switch (status) {
        case "pendiente de confirmacion": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "recibida": return "bg-green-100 text-green-800 border-green-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const calculateAverageRating = (criteria: Evaluation['criteria']): string => {
    const ratings = Object.values(criteria);
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    const average = sum / ratings.length;
    return average.toFixed(1);
}

export const columns = ({ userRole, onConfirm }: ColumnsConfig): ColumnDef<Evaluation>[] => [
  {
    accessorKey: "propertyName",
    header: "Propiedad",
  },
  {
    accessorKey: userRole === 'Arrendador' ? "tenantName" : "landlordName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {userRole === 'Arrendador' ? "Arrendatario" : "Arrendador"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "evaluationDate",
    header: "Fecha Evaluación",
    cell: ({ row }) => formatDate(row.getValue("evaluationDate")),
  },
  {
    accessorKey: "criteria",
    header: () => <div className="text-center">Rating Promedio</div>,
    cell: ({ row }) => {
        const criteria = row.getValue("criteria") as Evaluation['criteria'];
        const average = calculateAverageRating(criteria);
        return (
            <div className="flex items-center justify-center gap-1 font-medium">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>{average}</span>
            </div>
        )
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as Evaluation["status"];
        return <Badge className={`${getStatusBadgeVariant(status)} capitalize`}>{status}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const evaluation = row.original;

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
             {userRole === 'Arrendatario' && evaluation.status === 'pendiente de confirmacion' && onConfirm && (
                <DropdownMenuItem
                    className="text-primary focus:text-primary"
                    onClick={() => onConfirm(evaluation)}
                >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Confirmar Recepción
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
