import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import UserSearch from "@/components/UserSearch";
import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { XIcon, Loader2Icon } from "lucide-react";
import { addMembersToGroup } from "@/actions/groups";
import { useUser } from "@clerk/nextjs";

export function AddGroupMembersSheet({
  channelId,
  open,
  onOpenChange,
  existingMemberIds,
}: {
  channelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMemberIds: string[];
}) {
  const { user } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<Doc<"users">[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setSelectedUsers([]);
      setIsAdding(false);
    }
  };

  const handleSelectUser = (selectedUser: Doc<"users">) => {
    // Prevent adding existing members
    if (existingMemberIds.includes(selectedUser.userId)) {
      alert("This user is already in the group.");
      return;
    }
    
    setSelectedUsers((current) => {
      if (current.some((existing) => existing._id === selectedUser._id)) {
        return current;
      }
      return [...current, selectedUser];
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((current) =>
      current.filter((selectedUser) => selectedUser._id !== userId),
    );
  };

  const handleAddMembers = async () => {
    if (!user?.id || selectedUsers.length === 0) return;

    try {
      setIsAdding(true);
      const userIdsToAdd = selectedUsers.map(u => u.userId);
      const result = await addMembersToGroup(channelId, userIdsToAdd, user.id);
      
      if (result.success) {
        handleOpenChange(false);
      } else {
        alert("Failed to add members: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-none" side="bottom">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>Add Members</SheetTitle>
          <SheetDescription>
            Search and select people to add to this group.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-[40vh] max-h-[70vh] flex-1 overflow-y-auto p-4">
          <UserSearch
            className="max-w-none"
            onSelectUser={handleSelectUser}
            placeholder="Search people to add..."
          />

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Selected Users ({selectedUsers.length})
              </h3>
            </div>

            {selectedUsers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                Search and select people to add.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedUsers.map((selectedUser) => (
                  <div
                    className="flex items-center gap-3 rounded-lg border bg-card p-2"
                    key={selectedUser._id}
                  >
                    <Image
                      alt={selectedUser.name}
                      className="h-9 w-9 rounded-full object-cover"
                      height={36}
                      src={selectedUser.imageUrl}
                      width={36}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {selectedUser.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                    <Button
                      aria-label={`Remove ${selectedUser.name}`}
                      onClick={() => handleRemoveUser(selectedUser._id)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <SheetFooter className="border-t bg-background p-4 flex-col sm:flex-col gap-2">
          <Button
            disabled={selectedUsers.length === 0 || isAdding}
            onClick={handleAddMembers}
            className="w-full"
          >
            {isAdding ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              "Add to Group"
            )}
          </Button>
          <Button onClick={() => handleOpenChange(false)} variant="outline" className="w-full">
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
