import { FC } from "react";
import { CircleUser } from "lucide-react";

interface ProfileSectionProps {
  user: {
    username: string | null;
    photoURL: string | null;
  } | null;
}

export const ProfileSection: FC<ProfileSectionProps> = ({ user }) => (
  <div className="mt-auto pl-0 p-2">
    <a href="/profile" className="flex items-center px-4 mb-2 mx-2 ml-5">
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt="User Avatar"
          className="h-10 w-10 rounded-full"
        />
      ) : (
        <CircleUser className="h-10 w-10" />
      )}
      <div className="ml-3 block text-sm font-semibold text-gray-800">
        {user?.username || "My Account"}
        <span className="block text-xs text-gray-700">Edit Profile</span>
      </div>
    </a>
  </div>
);
