import React from "react";

import { Card, CardHeader, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useUser } from "../context/UserContext";

const Profile = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col items-center gap-2 p-6 bg-white rounded-t-2xl">
          <Avatar className="w-24 h-24">
            <AvatarImage
              className="rounded-full"
              src={`${import.meta.env.VITE_BASE_URL}${user.image}`}
            />
            <AvatarFallback className="text-sm  border-2 border-black flex items-center justify-center">
              {user?.username.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{user.username}</h2>
          <Badge>{user.role || "User"}</Badge>
        </CardHeader>
        <CardContent className="bg-gray-50 p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-base font-medium">{user.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-base font-medium">{user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
