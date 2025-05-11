import { Link } from "react-router-dom";
import { FileCheck2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FC } from 'react';
import logo from "../../components/icons/Ayush.png";;


interface AddSidebarProps {
  activePage: string;
  user: {
    userid: number | null;
    email: string | null;
    username: string | null;
    institute_id: number | null;
    type_id: number | null;
  } | null;
}


export const SidebarHeader: FC<AddSidebarProps> = ({ user }) => {
  return ( // Use return to properly return the JSX
    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
      <Link to={`/dashboard/${user?.username}`} className="flex items-center gap-2 font-semibold"> {/* Use template literals with backticks */}
        {/* <FileCheck2 className="h-6 w-6" />
        <span>ReportEase</span> */}
        {/* <img
          src={logo}
          alt="ReportEase Logo"
          className="h-auto w-auto h-[45px]"
        /> */}
      </Link>
      <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
    </div>
  );
};




