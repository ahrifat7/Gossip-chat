/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useChatContext, Avatar as StreamAvatar, useChannelStateContext } from "stream-chat-react";
import { ArrowLeftIcon, PencilIcon, UserPlusIcon, LogOutIcon, MoreVerticalIcon, CrownIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { AddGroupMembersSheet } from "./AddGroupMembersSheet";
import { removeMemberFromGroup, updateGroupRole, leaveGroup, renameGroup } from "@/actions/groups";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function MobileGroupInfo({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { channel, setActiveChannel } = useChatContext();
  const { members } = useChannelStateContext();
  const { user } = useUser();
  const router = useRouter();

  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!channel || !user?.id) return null;

  const adminIds = ((channel.data as any)?.adminIds as string[]) || [];
  const isCurrentUserAdmin = adminIds.includes(user.id);
  const channelName = (channel.data as any)?.name || "Group Chat";

  // Actions
  const handleRenameGroup = async () => {
    if (!newGroupName.trim() || newGroupName === channelName) {
      setIsRenameDialogOpen(false);
      return;
    }
    
    setIsProcessing(true);
    const result = await renameGroup(channel.id!, newGroupName.trim(), user.id);
    setIsProcessing(false);
    
    if (result.success) {
      setIsRenameDialogOpen(false);
    } else {
      alert("Failed to rename group: " + result.error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    
    setIsProcessing(true);
    const result = await leaveGroup(channel.id!, user.id);
    setIsProcessing(false);
    
    if (result.success) {
      onOpenChange(false);
      setActiveChannel(undefined);
      router.push("/dashboard?tab=chats");
    } else {
      alert("Failed to leave group: " + result.error);
    }
  };

  const handleMemberAction = async (action: "remove" | "promote" | "demote", targetUserId: string) => {
    setIsProcessing(true);
    let result;
    
    if (action === "remove") {
      if (!window.confirm("Remove this user from the group?")) {
        setIsProcessing(false);
        return;
      }
      result = await removeMemberFromGroup(channel.id!, targetUserId, user.id);
    } else {
      result = await updateGroupRole(channel.id!, targetUserId, action, user.id);
    }
    
    setIsProcessing(false);
    if (result?.success) {
      setSelectedMemberId(null);
    } else {
      alert(`Failed to ${action} user: ` + result?.error);
    }
  };

  const activeMembers = Object.values(members || {}).filter(m => !m.user?.deleted_at);
  const selectedMember = activeMembers.find(m => m.user_id === selectedMemberId);
  const isSelectedUserAdmin = selectedMemberId ? adminIds.includes(selectedMemberId) : false;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-none flex flex-col bg-background/95 backdrop-blur" side="bottom" style={{ height: "100dvh" }}>
          
          {/* Top Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon-sm" className="-ml-2">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">Group Info</h1>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+2rem)]">
            
            {/* Group Profile Info */}
            <div className="flex flex-col items-center justify-center py-8 px-4 border-b">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-4 shadow-sm border">
                {(channel.data as any)?.image ? (
                  <img src={(channel.data as any).image as string} alt={channelName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">👥</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-center">{channelName}</h2>
                {isCurrentUserAdmin && (
                  <Button variant="ghost" size="icon-sm" onClick={() => { setNewGroupName(channelName); setIsRenameDialogOpen(true); }}>
                    <PencilIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Group • {activeMembers.length} members</p>
            </div>

            {/* Add Member Action */}
            <div className="p-4 border-b">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => setIsAddMembersOpen(true)}
              >
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <UserPlusIcon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold">Add Members</span>
              </Button>
            </div>

            {/* Members List */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Members ({activeMembers.length})
              </h3>
              
              <div className="space-y-1">
                {/* Always show current user first */}
                {activeMembers.sort((a, b) => {
                  if (a.user_id === user.id) return -1;
                  if (b.user_id === user.id) return 1;
                  return (a.user?.name || "").localeCompare(b.user?.name || "");
                }).map((member) => {
                  const isMe = member.user_id === user.id;
                  const isAdmin = adminIds.includes(member.user_id!);

                  return (
                    <div 
                      key={member.user_id} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => !isMe && setSelectedMemberId(member.user_id!)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <StreamAvatar image={member.user?.image} name={member.user?.name} />
                        </div>
                        <div>
                          <p className="font-medium text-[15px]">
                            {isMe ? "You" : member.user?.name || "Unknown User"}
                          </p>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              <CrownIcon className="h-3 w-3" /> Admin
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!isMe && (
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave Group Action */}
            <div className="p-4 mt-4 border-t">
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-3 h-12 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleLeaveGroup}
                disabled={isProcessing}
              >
                <LogOutIcon className="h-5 w-5" />
                <span className="font-semibold">Leave Group</span>
              </Button>
            </div>
            
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Members Sheet */}
      <AddGroupMembersSheet 
        open={isAddMembersOpen} 
        onOpenChange={setIsAddMembersOpen} 
        channelId={channel.id!} 
        existingMemberIds={activeMembers.map(m => m.user_id!).filter(Boolean)}
      />

      {/* Rename Group Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Rename Group</DialogTitle>
            <DialogDescription>
              Enter a new name for this group chat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newGroupName} 
              onChange={(e) => setNewGroupName(e.target.value)} 
              placeholder="Group name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameGroup} disabled={isProcessing || !newGroupName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Action Bottom Sheet */}
      {selectedMember && (
        <Sheet open={!!selectedMemberId} onOpenChange={(open) => !open && setSelectedMemberId(null)}>
          <SheetContent side="bottom" className="sm:max-w-none p-0">
            <div className="p-6 pb-8 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 overflow-hidden rounded-full">
                  <StreamAvatar image={selectedMember.user?.image} name={selectedMember.user?.name} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedMember.user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{isSelectedUserAdmin ? "Group Admin" : "Group Member"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start h-12" onClick={() => {
                  // Logic to message user directly (future enhancement)
                  alert("Future enhancement: Route to 1-on-1 chat with " + selectedMember.user?.name);
                  setSelectedMemberId(null);
                }}>
                  Message {selectedMember.user?.name}
                </Button>

                {isCurrentUserAdmin && (
                  <>
                    {isSelectedUserAdmin ? (
                      <Button variant="outline" className="w-full justify-start h-12" onClick={() => handleMemberAction("demote", selectedMemberId!)}>
                        Dismiss as Admin
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full justify-start h-12" onClick={() => handleMemberAction("promote", selectedMemberId!)}>
                        Make Admin
                      </Button>
                    )}
                    
                    <Button variant="destructive" className="w-full justify-start h-12 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleMemberAction("remove", selectedMemberId!)}>
                      Remove from Group
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
