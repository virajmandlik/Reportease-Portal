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
  { id: "1", description: "Total students for the selected year" },
  { id: "2", description: "Total faculty for the selected year" },
  { id: "3", description: "Programs offered in the selected year" },
  { id: "4", description: "Results statistics for the selected year" },
  { id: "5", description: "Average grades for the selected year" },
  { id: "6", description: "Department-wise student distribution" },
  { id: "7", description: "Department-wise faculty distribution" },
  { id: "8", description: "Detailed report of students by program" },
  { id: "9", description: "Total courses offered in the selected year" },
  { id: "10", description: "Course statistics by department" },
];

export const AcademicDataTableDemo = ({
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
          checked={
            table.getIsAllPageRowsSelected() || 
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
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
