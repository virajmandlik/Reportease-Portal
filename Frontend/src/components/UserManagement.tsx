"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

interface User {
  id: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  mobile: number | null;
  accountCreated: string | number | Date;
  role: string | null;
  status: number;
  gender: string;
  lastUpdated: string | number | Date;
}

const MoreDetailsCell = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        View Details
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md rounded-lg shadow-lg p-6 bg-white">
    <DialogTitle className="text-2xl font-bold text-gray-800 mb-4">
      User Details
    </DialogTitle>
    <DialogDescription>
      <div className="space-y-2">
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">First Name:</h3>
          <p className="text-gray-800">{user.firstName}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Last Name:</h3>
          <p className="text-gray-800">{user.lastName}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Username:</h3>
          <p className="text-gray-800">{user.username}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Email:</h3>
          <p className="text-gray-800">{user.email}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Mobile:</h3>
          <p className="text-gray-800">{user.mobile}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Gender:</h3>
          <p className="text-gray-800">{user.gender}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Account Created:</h3>
          <p className="text-gray-800">
            {new Date(user.accountCreated).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Role:</h3>
          <p className="text-gray-800">{user.role}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Status:</h3>
          <p className="text-gray-800">{user.status}</p>
        </div>
        <div className="flex items-center">
          <h3 className="font-medium text-gray-600 w-1/3">Last updated:</h3>
          <p className="text-gray-800">
          {new Date(user.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </DialogDescription>
    <DialogClose asChild>
      <Button variant="outline" className="mt-4 w-full">
        Close
      </Button>
    </DialogClose>
  </DialogContent>
</Dialog>

    </>
  );
};

export const UserManagement = () => {
  const [data, setData] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/1`)
        const result: User[] = await response.json()

        // Transform the data
        const transformedData = result.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          accountCreated: new Date(user.accountCreated).toLocaleDateString(),
          role: mapRole(user.role),
          lastUpdated: new Date(user.lastUpdated).toLocaleDateString(),
          status: user.status === 1 ? "active" : "inactive",
        }))

        setData(transformedData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const mapRole = (role: number | null) => {
    switch (role) {
      case 1:
        return "Admin"
      case 2:
        return "Coordinator"
      case 3:
        return "Faculty"
      case 4:
        return "Student"
      default:
        return "Unknown" 
      }
  }

  const handleStatusToggle = async (user: User, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
  
    const confirmToggle = window.confirm(
      `Are you sure you want to change the status to "${newStatus}"?`
    );
  
    if (!confirmToggle) return;
  
    try {
      console.log('sent status: ', newStatus);
      const response = await fetch(
        `http://localhost:3000/api/toggle-user-status/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
  
      if (response.ok) {
        // Update the state to reflect the new status
        setData((prevData) =>
          prevData.map((u) =>
            u.id === user.id ? { ...u, status: newStatus } : u
          )
        );
        alert(`User status successfully updated to "${newStatus}".`);
      } else {
        throw new Error("Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update the user status. Please try again.");
    }
  };

  const columns: ColumnDef<User>[] = [
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="uppercase">{row.getValue("firstName")}</div>,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="uppercase">{row.getValue("lastName")}</div>,
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div>{row.getValue("username")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div>{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("role")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        const currentStatus = user.status;
  
        return (
          <Button
            variant={currentStatus === "active" ? "default" : "destructive"}
            className={currentStatus === "active" ? "bg-green-500 hover:bg-green-700" : "hover:bg-red-600"}
            size="sm"
            onClick={() => handleStatusToggle(user, currentStatus)}
          >
            {currentStatus === "active" ? "Active" : "Inactive"}
          </Button>
        );
      },
    },
    {
      id: "moreDetails",
      header: "More Details",
      cell: ({ row }) => {
        const user = row.original;
        return <MoreDetailsCell user={user} />;
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names..."
          value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("firstName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className ="rounded-md border">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// "use client"

// import * as React from "react"
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table"
// import { ArrowUpDown, ChevronDown } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Input } from "@/components/ui/input"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog" // Assuming you have a Dialog component

// interface User {
//   id: number | null;
//   email: string | null;
//   firstName: string | null;
//   lastName: string | null;
//   username: string | null;
//   mobile: number | null;
//   accountCreated: string | number | Date;
//   role: string | null;
//   status: string;
//   gender: string;
// }

// export const UserManagement = () => {
//   const [data, setData] = React.useState<User[]>([])
//   const [loading, setLoading] = React.useState(true)
//   const [sorting, setSorting] = React.useState<SortingState>([])
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
//   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
//   const [rowSelection, setRowSelection] = React.useState({})

//   React.useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`http://localhost:3000/api/users/1`)
//         const result: User[] = await response.json()

//         // Transform the data
//         const transformedData = result.map(user => ({
//           id: user.id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           username: user.username,
//           email: user.email,
//           mobile: user.mobile,
//           gender: user.gender,
//           accountCreated: new Date(user.accountCreated).toLocaleDateString(), // Format date as needed
//           role: mapRole(user.role),
//           status: user.status === "1" ? "active" : "inactive",
//         }))

//         setData(transformedData)
//       } catch (error) {
//         console.error("Error fetching data:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   })

//   const mapRole = (role: any) => {
//     switch (role) {
//       case "1":
//         return "Admin"
//       case "2":
//         return "Coordinator"
//       case "3":
//         return "Faculty"
//       case "4":
//         return "Student"
//       default:
//         return "Unknown"
//     }
//   }

//   const columns: ColumnDef<User>[] = [
//     {
//       id: "select",
//       header: ({ table }) => (
//         <Checkbox
//           checked={
//             table.getIsAllPageRowsSelected() ||
//             (table.getIsSomePageRowsSelected() && "indeterminate")
//           }
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       ),
//       cell: ({ row }) => (
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select row"
//         />
//       ),
//       enableSorting: false,
//       enableHiding: false,
//     },
//     {
//       accessorKey: "firstName",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             First Name
//             <ArrowUpDown />
//           </Button>
//         )
//       },
//       cell: ({ row }) => <div className="capitalize">{row.getValue("firstName")}</div>,
//     },
//     {
//       accessorKey: "lastName",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             Last Name
//             <ArrowUpDown />
//           </Button>
//         )
//       },
//       cell: ({ row }) => <div className="capitalize">{row.getValue("lastName")}</div>,
//     },
//     {
//       accessorKey: "username",
//       header: "Username",
//       cell: ({ row }) => (
//         <div className="capitalize">{row.getValue("username")}</div>
//       ),
//     },
//     {
//       accessorKey: "email",
//       header: "Email",
//       cell: ({ row }) => (
//         <div className="capitalize">{row.getValue("email")}</div>
//       ),
//     },
//     {
//       accessorKey: "role",
//       header: "Role",
//       cell: ({ row }) => (
//         <div className="capitalize">{row.getValue("role")}</div>
//       ),
//     },
//     {
//       accessorKey: "status",
//       header: "Status",
//       cell: ({ row }) => (
//         <div className="capitalize">
//           {row.getValue("status") === "active" ? (
//             <Button variant="default" size="sm">
//               Active
//             </Button>
//           ) : (
//             <Button variant="destructive" size="sm">
//               Inactive
//             </Button>
//           )}
//         </div>
//       ),
//     },
//     {
//       id: "moreDetails",
//       header: "More Details",
//       cell: ({ row }) => {
//         const user = row.original
//         const [isOpen, setIsOpen] = React.useState(false)

//         return (
//           <>
//             <Button variant="outline" onClick={() => setIsOpen(true)}>
//               View Details
//             </Button>
//             <Dialog open={isOpen} onOpenChange={setIsOpen}>
//               <DialogContent>
//                 <DialogTitle>User Details</DialogTitle>
//                 <DialogDescription>
//                   <p>First Name: {user.firstName}</p>
//                   <p>Last Name: {user.lastName}</p>
//                   <p>Username: {user.username}</p>
//                   <p>Email: {user.email}</p>
//                   <p>Mobile: {user.mobile}</p>
//                   <p>Gender: {user.gender}</p>
//                   <p>Account Created: {user.accountCreated.toLocaleString()}</p>
//                   <p>Role: {user.role}</p>
//                   <p>Status: {user.status}</p>
//                 </DialogDescription>
//                 <DialogClose asChild>
//                   <Button variant="outline">Close</Button>
//                 </DialogClose>
//               </DialogContent>
//             </Dialog>
//           </>
//         )
//       },
//     },
//   ]

//   if (loading) {
//     return <div>Loading...</div>
//   }

//   const table = useReactTable({
//     data,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   })

//   return (
//     <div className="w-full">
//       <div className="flex items-center py-4">
//         <Input
//           placeholder="Filter names..."
//           value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
//           onChange={(event) =>
//             table.getColumn("firstName")?.setFilterValue(event.target.value)
//           }
//           className="max-w-sm"
//         />
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" className="ml-auto">
//               Columns <ChevronDown />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             {table
//               .getAllColumns()
//               .filter((column) => column.getCanHide())
//               .map((column) => {
//                 return (
//                   <DropdownMenuCheckboxItem
//                     key={column.id}
//                     className="capitalize"
//                     checked={column.getIsVisible()}
//                     onCheckedChange={(value) =>
//                       column.toggleVisibility(!!value)
//                     }
//                   >
//                     {column.id}
//                   </DropdownMenuCheckboxItem>
//                 )
//               })}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//       <div className="rounded-md border">
//  <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   )
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       <div className="flex items-center justify-end space-x-2 py-4">
//         <div className="flex-1 text-sm text-muted-foreground">
//           {table.getFilteredSelectedRowModel().rows.length} of{" "}
//           {table.getFilteredRowModel().rows.length} row(s) selected.
//         </div>
//         <div className="space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//           >
//             Previous
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // "use client"

// // import * as React from "react"
// // import {
// //   ColumnDef,
// //   ColumnFiltersState,
// //   SortingState,
// //   VisibilityState,
// //   flexRender,
// //   getCoreRowModel,
// //   getFilteredRowModel,
// //   getPaginationRowModel,
// //   getSortedRowModel,
// //   useReactTable,
// // } from "@tanstack/react-table"
// // import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

// // import { Button } from "@/components/ui/button"
// // import { Checkbox } from "@/components/ui/checkbox"
// // import {
// //   DropdownMenu,
// //   DropdownMenuCheckboxItem,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuLabel,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu"
// // import { Input } from "@/components/ui/input"
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table"

// // const data: Payment[] = [
// //   {
// //     id: "m5gr84i9",
// //     amount: 316,
// //     status: "success",
// //     email: "ken99@yahoo.com",
// //   },
// //   {
// //     id: "3u1reuv4",
// //     amount: 242,
// //     status: "success",
// //     email: "Abe45@gmail.com",
// //   },
// //   {
// //     id: "derv1ws0",
// //     amount: 837,
// //     status: "processing",
// //     email: "Monserrat44@gmail.com",
// //   },
// //   {
// //     id: "5kma53ae",
// //     amount: 874,
// //     status: "success",
// //     email: "Silas22@gmail.com",
// //   },
// //   {
// //     id: "bhqecj4p",
// //     amount: 721,
// //     status: "failed",
// //     email: "carmella@hotmail.com",
// //   },
// // ]

// // export type Payment = {
// //   id: string
// //   amount: number
// //   status: "pending" | "processing" | "success" | "failed"
// //   email: string
// // }

// // export const columns: ColumnDef<Payment>[] = [
// //   {
// //     id: "select",
// //     header: ({ table }) => (
// //       <Checkbox
// //         checked={
// //           table.getIsAllPageRowsSelected() ||
// //           (table.getIsSomePageRowsSelected() && "indeterminate")
// //         }
// //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
// //         aria-label="Select all"
// //       />
// //     ),
// //     cell: ({ row }) => (
// //       <Checkbox
// //         checked={row.getIsSelected()}
// //         onCheckedChange={(value) => row.toggleSelected(!!value)}
// //         aria-label="Select row"
// //       />
// //     ),
// //     enableSorting: false,
// //     enableHiding: false,
// //   },
// //   {
// //     accessorKey: "status",
// //     header: "Status",
// //     cell: ({ row }) => (
// //       <div className="capitalize">{row.getValue("status")}</div>
// //     ),
// //   },
// //   {
// //     accessorKey: "email",
// //     header: ({ column }) => {
// //       return (
// //         <Button
// //           variant="ghost"
// //           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
// //         >
// //           Email
// //           <ArrowUpDown />
// //         </Button>
// //       )
// //     },
// //     cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
// //   },
// //   {
// //     accessorKey: "amount",
// //     header: () => <div className="text-right">Amount</div>,
// //     cell: ({ row }) => {
// //       const amount = parseFloat(row.getValue("amount"))

// //       // Format the amount as a dollar amount
// //       const formatted = new Intl.NumberFormat("en-US", {
// //         style: "currency",
// //         currency: "USD",
// //       }).format(amount)

// //       return <div className="text-right font-medium">{formatted}</div>
// //     },
// //   },
// //   {
// //     id: "actions",
// //     enableHiding: false,
// //     cell: ({ row }) => {
// //       const payment = row.original

// //       return (
// //         <DropdownMenu>
// //           <DropdownMenuTrigger asChild>
// //             <Button variant="ghost" className="h-8 w-8 p-0">
// //               <span className="sr-only">Open menu</span>
// //               <MoreHorizontal />
// //             </Button>
// //           </DropdownMenuTrigger>
// //           <DropdownMenuContent align="end">
// //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
// //             <DropdownMenuItem
// //               onClick={() => navigator.clipboard.writeText(payment.id)}
// //             >
// //               Copy payment ID
// //             </DropdownMenuItem>
// //             <DropdownMenuSeparator />
// //             <DropdownMenuItem>View customer</DropdownMenuItem>
// //             <DropdownMenuItem>View payment details</DropdownMenuItem>
// //           </DropdownMenuContent>
// //         </DropdownMenu>
// //       )
// //     },
// //   },
// // ]

// // export function UserManagement() {
// //   const [sorting, setSorting] = React.useState<SortingState>([])
// //   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
// //     []
// //   )
// //   const [columnVisibility, setColumnVisibility] =
// //     React.useState<VisibilityState>({})
// //   const [rowSelection, setRowSelection] = React.useState({})

// //   const table = useReactTable({
// //     data,
// //     columns,
// //     onSortingChange: setSorting,
// //     onColumnFiltersChange: setColumnFilters,
// //     getCoreRowModel: getCoreRowModel(),
// //     getPaginationRowModel: getPaginationRowModel(),
// //     getSortedRowModel: getSortedRowModel(),
// //     getFilteredRowModel: getFilteredRowModel(),
// //     onColumnVisibilityChange: setColumnVisibility,
// //     onRowSelectionChange: setRowSelection,
// //     state: {
// //       sorting,
// //       columnFilters,
// //       columnVisibility,
// //       rowSelection,
// //     },
// //   })

// //   return (
// //     <div className="w-full">
// //       <div className="flex items-center py-4">
// //         <Input
// //           placeholder="Filter emails..."
// //           value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
// //           onChange={(event) =>
// //             table.getColumn("email")?.setFilterValue(event.target.value)
// //           }
// //           className="max-w-sm"
// //         />
// //         <DropdownMenu>
// //           <DropdownMenuTrigger asChild>
// //             <Button variant="outline" className="ml-auto">
// //               Columns <ChevronDown />
// //             </Button>
// //           </DropdownMenuTrigger>
// //           <DropdownMenuContent align="end">
// //             {table
// //               .getAllColumns()
// //               .filter((column) => column.getCanHide())
// //               .map((column) => {
// //                 return (
// //                   <DropdownMenuCheckboxItem
// //                     key={column.id}
// //                     className="capitalize"
// //                     checked={column.getIsVisible()}
// //                     onCheckedChange={(value) =>
// //                       column.toggleVisibility(!!value)
// //                     }
// //                   >
// //                     {column.id}
// //                   </DropdownMenuCheckboxItem>
// //                 )
// //               })}
// //           </DropdownMenuContent>
// //         </DropdownMenu>
// //       </div>
// //       <div className="rounded-md border">
// //         <Table>
// //           <TableHeader>
// //             {table.getHeaderGroups().map((headerGroup) => (
// //               <TableRow key={headerGroup.id}>
// //                 {headerGroup.headers.map((header) => {
// //                   return (
// //                     <TableHead key={header.id}>
// //                       {header.isPlaceholder
// //                         ? null
// //                         : flexRender(
// //                             header.column.columnDef.header,
// //                             header.getContext()
// //                           )}
// //                     </TableHead>
// //                   )
// //                 })}
// //               </TableRow>
// //             ))}
// //           </TableHeader>
// //           <TableBody>
// //             {table.getRowModel().rows?.length ? (
// //               table.getRowModel().rows.map((row) => (
// //                 <TableRow
// //                   key={row.id}
// //                   data-state={row.getIsSelected() && "selected"}
// //                 >
// //                   {row.getVisibleCells().map((cell) => (
// //                     <TableCell key={cell.id}>
// //                       {flexRender(
// //                         cell.column.columnDef.cell,
// //                         cell.getContext()
// //                       )}
// //                     </TableCell>
// //                   ))}
// //                 </TableRow>
// //               ))
// //             ) : (
// //               <TableRow>
// //                 <TableCell
// //                   colSpan={columns.length}
// //                   className="h-24 text-center"
// //                 >
// //                   No results.
// //                 </TableCell>
// //               </TableRow>
// //             )}
// //           </TableBody>
// //         </Table>
// //       </div>
// //       <div className="flex items-center justify-end space-x-2 py-4">
// //         <div className="flex-1 text-sm text-muted-foreground">
// //           {table.getFilteredSelectedRowModel().rows.length} of{" "}
// //           {table.getFilteredRowModel().rows.length} row(s) selected.
// //         </div>
// //         <div className="space-x-2">
// //           <Button
// //             variant="outline"
// //             size="sm"
// //             onClick={() => table.previousPage()}
// //             disabled={!table.getCanPreviousPage()}
// //           >
// //             Previous
// //           </Button>
// //           <Button
// //             variant="outline"
// //             size="sm"
// //             onClick={() => table.nextPage()}
// //             disabled={!table.getCanNextPage()}
// //           >
// //             Next
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }