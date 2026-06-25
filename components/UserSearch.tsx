"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { useUserSearch } from "@/hooks/useUserSearch";
import { cn } from "@/lib/utils";

import { useUser } from "@clerk/nextjs";
import { Search, UserIcon, X } from "lucide-react";
import { Input } from "./ui/input";
import { InlineSpinner } from "./LoadingSpinner";
import Image from "next/image";
import { Mail } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { UserPlusIcon, ClockIcon, CheckIcon, MessageCircleIcon } from "lucide-react";
import { Button } from "./ui/button";

function UserSearch({
  onSelectUser,
  placeholder = "Search users by name or email...",
  className,
}: {
  onSelectUser: (user: Doc<"users">) => void;
  placeholder?: string;
  className?: string;
}) {
  const { searchTerm, setSearchTerm, searchResults, isLoading } =
    useUserSearch();

  const { user } = useUser();

  // Filter out the current logged-in user from search results
  const filteredResults = searchResults.filter(
    (searchUser) => searchUser.userId !== user?.id,
  );

  const resultUserIds = filteredResults.map(u => u.userId);
  const connectionStatuses = useQuery(
    api.friends.getConnectionStatuses,
    user?.id && resultUserIds.length > 0
      ? { currentUserId: user.id, otherUserIds: resultUserIds }
      : "skip"
  );

  const sendRequest = useMutation(api.friends.sendRequest);
  const acceptRequest = useMutation(api.friends.acceptRequest);

  const handleSelectUser = (searchUser: (typeof searchResults)[0]) => {
    onSelectUser?.(searchUser);
    setSearchTerm(""); // Clear search after selection
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchTerm.trim() && (
        <div className="mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 relative">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <InlineSpinner size="sm" />
                <span>Searching...</span>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <UserIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found matching &quot;{searchTerm}&quot;</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredResults.map((searchUser) => {
                const statusObj = connectionStatuses?.[searchUser.userId] || { status: "none" };
                const isFriends = statusObj.status === "friends";

                return (
                  <div
                    key={searchUser._id}
                    className={cn(
                      "w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors",
                      "border-b border-border last:border-b-0",
                      isFriends ? "cursor-pointer" : "cursor-default"
                    )}
                    onClick={() => isFriends ? handleSelectUser(searchUser) : undefined}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* User Avatar */}
                      <div className="relative shrink-0">
                        <Image
                          src={searchUser.imageUrl}
                          alt={searchUser.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-foreground truncate">
                            {searchUser.name}
                          </p>
                        </div>

                        <div className="flex items-center space-x-1 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-sm text-muted-foreground truncate">
                            {searchUser.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center justify-end pl-3">
                      {statusObj.status === "none" && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            user?.id && sendRequest({ senderId: user.id, receiverId: searchUser.userId });
                          }}
                          className="h-8 w-8 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {statusObj.status === "pending_sent" && (
                        <div className="flex h-8 items-center gap-1 rounded-full bg-muted px-3 text-[10px] font-medium text-muted-foreground">
                          <ClockIcon className="h-3 w-3" />
                          <span>Pending</span>
                        </div>
                      )}
                      {statusObj.status === "pending_received" && statusObj.requestId && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptRequest({ requestId: statusObj.requestId as any });
                          }}
                          className="h-8 rounded-full bg-primary text-xs"
                        >
                          Accept
                        </Button>
                      )}
                      {statusObj.status === "friends" && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectUser(searchUser);
                          }}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <MessageCircleIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserSearch;
