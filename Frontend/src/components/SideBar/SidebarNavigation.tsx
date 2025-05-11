import { FC } from "react";
import { Link } from "react-router-dom";
import { Home, FileInput } from "lucide-react";

interface SidebarNavigationProps {
  activePage: string;
  user: {
    username: string | null;
    institute_id: number | null;
    type_id: number | null;
  } | null;
}

export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  activePage,
  user,
}) => {
  const links = [
    {
      to: `/dashboard/${user?.username}`,
      label: "Dashboard",
      icon: Home,
      condition: true,
    },
    {
      to: "/admin/add-data",
      label: "Add Data",
      icon: FileInput, // Replace with a relevant icon
      condition: user?.type_id === 3, // Condition for faculty
    },
  ];

  return (
    <nav className="flex flex-col items-start px-2 text-sm font-medium lg:px-4 space-y-1">
      {links.map(({ to, label, icon: Icon, condition }) => {
        const isActive = activePage === label.toLowerCase().replace(" ", "-");

        return (
          condition && (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all hover:text-primary ${
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        );
      })}
    </nav>
  );
};
