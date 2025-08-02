"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, MessageSquare, CheckCircle2 } from "lucide-react"
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
import type { Incident, UserProfile } from "@/types"

type ColumnsConfig = {
    onRespond: (incident: Incident) => void;
    onClose: (incidentId: string) => void;
    currentUser: UserProfile;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
};

const getStatusBadgeVariant = (status: Incident["status"]) => {
    switch (status) {
        case "pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "respondido": return "bg-blue-100 text-blue-800 border-blue-200";
        case "cerrado": return "bg-gray-100 text-gray-800 border-gray-200";
        default: return "bg-secondary text-secondary-foreground";
    }
};

export const columns = ({ onRespond, onClose, currentUser }: ColumnsConfig): ColumnDef<Incident>[] => [
  {
    accessorKey: "propertyName",
    header: "Propiedad",
  },
  {
    accessorKey: "tenantName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Arrendatario
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <span className="capitalize">{type.replace(/_/g, ' ')}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha Creación",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as Incident["status"];
        return <Badge className={`${getStatusBadgeVariant(status)} capitalize`}>{status}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const incident = row.original;

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
            {incident.status !== "cerrado" && (
                <DropdownMenuItem onClick={() => onRespond(incident)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Responder
                </DropdownMenuItem>
            )}
            {incident.status !== "cerrado" && incident.createdBy === currentUser.uid && (
                <DropdownMenuItem onClick={() => onClose(incident.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Cerrar Incidente
                </DropdownMenuItem>
            )}
            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
