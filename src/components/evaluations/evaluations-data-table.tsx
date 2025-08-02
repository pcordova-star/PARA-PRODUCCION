"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserRole } from "@/types"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function EvaluationsDataTable<TData extends { tenantName?: string; landlordName?: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })
  
  const userRole: UserRole = data.length > 0 && 'tenantName' in data[0] ? 'Arrendador' : 'Arrendatario';
  const filterColumn = userRole === 'Arrendador' ? 'tenantName' : 'landlordName';
  const filterPlaceholder = userRole === 'Arrendador' ? 'Filtrar por arrendatario...' : 'Filtrar por arrendador...';

  return (
    <div>
       <div className="flex flex-wrap items-center gap-4 py-4">
        <Input
          placeholder="Filtrar por propiedad..."
          value={(table.getColumn("propertyName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("propertyName")?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
                table.getColumn("status")?.setFilterValue(value === "all" ? null : value)
            }
        >
            <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente de confirmacion">Pendiente</SelectItem>
                <SelectItem value="recibida">Recibida</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
