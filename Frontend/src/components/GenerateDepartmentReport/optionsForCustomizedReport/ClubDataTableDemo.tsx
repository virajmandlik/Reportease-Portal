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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export type ReportOption = {
  id: string;
  description: string;
  tooltip?: string;
};

const reportOptions: ReportOption[] = [
  { 
    id: "1", 
    description: "Club Basic Information",
    tooltip: "Includes club name, type, head, and department details"
  },
  { 
    id: "2", 
    description: "Club Activities Count",
    tooltip: "Detailed count of events by type and club"
  },
  { 
    id: "3", 
    description: "Comprehensive Budget Analysis",
    tooltip: "Detailed financial breakdown including total, average, min, and max event budgets"
  },
  { 
    id: "4", 
    description: "Event Type Distribution",
    tooltip: "Breakdown of events by category and club"
  },
  { 
    id: "5", 
    description: "Club Faculty and Mentorship",
    tooltip: "Information about faculty advisors and mentors for each club"
  },
  { 
    id: "6", 
    description: "Detailed Event Summaries",
    tooltip: "In-depth analysis of club events, including first and last events"
  },
  { 
    id: "7", 
    description: "Member Engagement Metrics",
    tooltip: "Comprehensive analysis of club membership and participation"
  }
];

export const ClubDataTableDemo = ({ 
  setSelectedOptions 
}: { 
  setSelectedOptions: (options: string[]) => void 
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<ReportOption>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const selectedIds = value 
              ? reportOptions.map(option => option.id)
              : [];
            setSelectedOptions(selectedIds);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const selectedIds = table.getRowModel().rows
              .filter(r => r.getIsSelected())
              .map(r => r.original.id);
            console.log("Selected Club Report Options:", selectedIds);
            setSelectedOptions(selectedIds);
          }}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "description",
      header: "Club Report Options",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span>{row.getValue("description")}</span>
          {row.original.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
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
              data-state={row.getIsSelected() && "selected"}
              className="hover:bg-gray-100 transition-colors"
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