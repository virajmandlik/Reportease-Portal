"use client";

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

// Expanded report options to include all 12 options
export type ReportOption = {
  id: string;
  description: string;
};

const reportOptions: ReportOption[] = [
  { id: "1", description: "All Events" },
  { id: "2", description: "Events with Department Details" },
  { id: "3", description: "Event Type Count" },
  { id: "4", description: "Venue Usage Statistics" },
  { id: "5", description: "Total Event Budget" },
  { id: "6", description: "Event Count by Department" },
  { id: "7", description: "Technical Events" },
  { id: "8", description: "Cultural Events" },
  { id: "9", description: "Monthly Event Distribution" },
  { id: "10", description: "Events with Clubs" },
  { id: "11", description: "Average Budget by Event Type" },
  { id: "12", description: "Budget Category Distribution" },
];

export const EventDataTableDemo: React.FC<{ 
  setSelectedOptions: (options: string[]) => void 
}> = ({ setSelectedOptions }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<{[key: string]: boolean}>({});

  // Update selected options when row selection changes
  React.useEffect(() => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    setSelectedOptions(selectedIds);
  }, [rowSelection, setSelectedOptions]);

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
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "description",
      header: "Event Report Options",
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
            <TableRow 
              key={row.id} 
              data-state={row.getIsSelected() ? "selected" : undefined}
            >
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