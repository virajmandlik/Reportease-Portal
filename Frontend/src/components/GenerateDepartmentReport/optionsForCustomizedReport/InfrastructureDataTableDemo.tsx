"use client"; // Ensure this component is treated as a client component

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ReportOption = {
  id: string;
  description: string;
};

const reportOptions: ReportOption[] = [
  { id: "1", description: "Total infrastructure projects for the selected year" },
  { id: "2", description: "Infrastructure projects with budget" },
  { id: "3", description: "Average budget for infrastructure projects" },
  { id: "4", description: "Total projects by department" },
  { id: "5", description: "Detailed report of infrastructure projects" },
];

export const InfrastructureDataTableDemo = ({
  setSelectedOptions,
  isCustomized,
}: {
  setSelectedOptions: (options: string[]) => void;
  isCustomized: boolean;
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

  const columns: ColumnDef<ReportOption>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            const selectedIds = table.getRowModel().rows
              .filter((r) => r.getIsSelected())
              .map((r) => r.original.id);

            if (value) {
              selectedIds.push(row.original.id);
            } else {
              const index = selectedIds.indexOf(row.original.id);
              if (index > -1) {
                selectedIds.splice(index, 1);
              }
            }

            row.toggleSelected(!!value);

            if (isCustomized) {
              setSelectedOptions(selectedIds);
              console.log("Customized selected options:", selectedIds);
            } else {
              setSelectedOptions(reportOptions.map((option) => option.id)); // Default to all options
              console.log("Default selected options:", reportOptions.map((option) => option.id));
            }
          }}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
  ];

  const table = useReactTable({
    data: reportOptions,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


