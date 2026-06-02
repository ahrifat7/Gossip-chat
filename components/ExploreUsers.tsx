"use client";

import { useState } from "react";
import UserSearch from "@/components/UserSearch";
import { NewChatDialog } from "@/components/NewChatDialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Doc } from "@/convex/_generated/dataModel";

export default function ExploreUsers() {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<Doc<"users"> | null>(null);
  const [users, setUsers] = useState<Doc<"users">[]>([]);



  const sortedUsers = users.slice().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Explore Users</h2>
        <NewChatDialog>
          <Button variant="outline">Create Group Chat</Button>
        </NewChatDialog>
      </div>
      <UserSearch onSelectUser={setSelectedUser} className="w-full" />
      {sortedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h8M8 11h8M8 15h8M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
            />
          </svg>
          <p className="text-lg font-medium">No users found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      ) : (
        <ul className="space-y-2 mt-4">
          {sortedUsers.map((u) => (
            <li
              key={u._id}
              className="flex items-center p-2 rounded-lg hover:bg-muted/20 cursor-pointer"
              onClick={() => setSelectedUser(u)}
            >
              <Image src={u.imageUrl} alt={u.name} width={40} height={40} className="rounded-full mr-3" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{u.name}</span>
                <span className="text-sm text-muted-foreground">{u.email}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
