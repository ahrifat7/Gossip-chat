"use client";

import { DashboardChatView } from "@/components/DashboardChatView";
import { InlineSpinner } from "@/components/LoadingSpinner";
import UserSearch from "@/components/UserSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useCreateNewChat } from "@/hooks/useCreateNewChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  Globe2Icon,
  MessageCircleIcon,
  UsersIcon,
  XIcon,
  BellIcon,
  UserPlusIcon,
  ClockIcon,
  CheckIcon,
  CameraIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Component, useEffect, useMemo, useState, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { Channel, ChannelSort } from "stream-chat";
import { ChannelList, InfiniteScroll, useChatContext } from "stream-chat-react";

type MobileChannelPreviewProps = ComponentProps<
  NonNullable<ComponentProps<typeof ChannelList>["Preview"]>
>;

type MobileTab = "chats" | "explore";

const channelSort: ChannelSort = {
  last_message_at: -1,
};

const channelOptions = {
  presence: true,
  state: true,
};

function formatPreviewTime(value: Date | string | null | undefined) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function MobileChannelPreview({
  channel,
  displayImage,
  displayTitle,
  latestMessagePreview,
  onSelect,
  unread,
}: MobileChannelPreviewProps) {
  const fallbackTitle =
    (channel.data as { name?: string } | undefined)?.name || "Conversation";
  const lastMessageAt =
    channel.state.last_message_at ?? channel.data?.last_message_at ?? null;

  return (
    <button
      className="flex w-full items-center gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors last:border-b-0 active:bg-accent/70"
      onClick={onSelect}
      type="button"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
        {displayImage ? (
          <Image
            alt={displayTitle || fallbackTitle}
            className="h-full w-full object-cover"
            height={48}
            src={displayImage}
            width={48}
          />
        ) : (
          <UsersIcon className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
            {displayTitle || fallbackTitle}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatPreviewTime(lastMessageAt)}
          </span>
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {latestMessagePreview || "No messages yet"}
          </p>
          {!!unread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MobileChatsTab({
  onOpenChat,
  onSwitchTab,
}: {
  onOpenChat: (channel: Channel) => void;
  onSwitchTab: (tab: MobileTab) => void;
}) {
  const { user } = useUser();

  if (!user?.id) {
    return (
      <div className="flex h-full items-center justify-center">
        <InlineSpinner />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <ChannelList
        EmptyStateIndicator={() => (
          <div className="flex min-h-[calc(100dvh-9rem)] flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageCircleIcon className="h-9 w-9" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              No active conversations yet
            </h2>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-muted-foreground">
              Go to Explore to find friends and start your first chat.
            </p>
            <Button className="mt-6" onClick={() => onSwitchTab("explore")}>
              Go to Explore
            </Button>
          </div>
        )}
        LoadingIndicator={() => (
          <div className="flex min-h-[calc(100dvh-9rem)] items-center justify-center">
            <InlineSpinner />
          </div>
        )}
        Paginator={InfiniteScroll}
        Preview={(props) => (
          <MobileChannelPreview
            {...props}
            onSelect={() => onOpenChat(props.channel)}
          />
        )}
        filters={{
          members: { $in: [user.id] },
          type: { $in: ["messaging", "team"] },
        }}
        options={channelOptions}
        setActiveChannelOnMount={false}
        sort={channelSort}
      />
    </div>
  );
}

function UserDirectoryItem({
  onSelect,
  user,
  status = "none",
  requestId,
  onSendRequest,
  onAcceptRequest,
}: {
  onSelect: (user: Doc<"users">) => void;
  user: Doc<"users">;
  status?: "friends" | "pending_sent" | "pending_received" | "none";
  requestId?: string;
  onSendRequest?: (userId: string) => void;
  onAcceptRequest?: (requestId: string) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between border-b border-border/70 px-1 py-3 last:border-b-0">
      <button
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 text-left",
          status !== "friends" && "cursor-default"
        )}
        onClick={() => status === "friends" ? onSelect(user) : undefined}
        disabled={status !== "friends"}
        type="button"
      >
        <Image
          alt={user.name}
          className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
          height={40}
          src={user.imageUrl}
          width={40}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </button>

      <div className="flex shrink-0 items-center justify-end pl-3">
        {status === "none" && onSendRequest && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onSendRequest(user.userId)}
            className="h-8 w-8 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <UserPlusIcon className="h-4 w-4" />
          </Button>
        )}
        {status === "pending_sent" && (
          <div className="flex h-8 items-center gap-1 rounded-full bg-muted px-3 text-[10px] font-medium text-muted-foreground">
            <ClockIcon className="h-3 w-3" />
            <span>Pending</span>
          </div>
        )}
        {status === "pending_received" && onAcceptRequest && requestId && (
          <Button
            size="sm"
            onClick={() => onAcceptRequest(requestId)}
            className="h-8 rounded-full bg-primary text-xs"
          >
            Accept
          </Button>
        )}
        {status === "friends" && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onSelect(user)}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <MessageCircleIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function MobileGroupSheet({
  onOpenChat,
  onOpenChange,
  open,
}: {
  onOpenChat: (channel: Channel) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { user } = useUser();
  const createNewChat = useCreateNewChat();
  const [selectedUsers, setSelectedUsers] = useState<Doc<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setSelectedUsers([]);
      setGroupName("");
      setGroupImage(null);
      setIsCreating(false);
    }
  };

  const handleSelectUser = (selectedUser: Doc<"users">) => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 4MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setGroupImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGroup = async () => {
    if (!user?.id || selectedUsers.length < 2) return;

    try {
      setIsCreating(true);
      const channel = await createNewChat({
        createdBy: user.id,
        groupName: groupName.trim() || undefined,
        groupImage: groupImage || undefined,
        members: [
          user.id,
          ...selectedUsers.map((selectedUser) => selectedUser.userId),
        ],
      });

      handleOpenChange(false);
      onOpenChat(channel);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-none" side="right">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>Create Group Chat</SheetTitle>
          <SheetDescription>
            Select at least 2 people to start a group conversation.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <UserSearch
            className="max-w-none"
            onSelectUser={handleSelectUser}
            placeholder="Search people to add..."
          />

          <div className="mt-5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="mobile-group-name"
            >
              Group name
            </label>
            <Input
              className="mt-2 h-11"
              id="mobile-group-name"
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Optional"
              value={groupName}
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-foreground block mb-2">
              Group image
            </label>
            <div className="flex items-center gap-4">
              <div 
                className="relative h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {groupImage ? (
                  <img src={groupImage} alt="Group preview" className="h-full w-full object-cover" />
                ) : (
                  <CameraIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {groupImage ? "Change Image" : "Add Image"}
                </Button>
                {groupImage && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setGroupImage(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Selected Users ({selectedUsers.length})
              </h3>
              <span className="text-xs text-muted-foreground">Minimum 2</span>
            </div>

            {selectedUsers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                Search and select people for your group.
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
        <SheetFooter className="border-t bg-background p-4">
          <Button
            disabled={selectedUsers.length < 2 || isCreating}
            onClick={handleCreateGroup}
          >
            {isCreating ? "Starting..." : "Start Group Chat"}
          </Button>
          <Button onClick={() => handleOpenChange(false)} variant="outline">
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

class DirectoryErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Directory query failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function MobileUserDirectory({
  activeUserId,
  onSelectUser,
}: {
  activeUserId: string | null;
  onSelectUser: (user: Doc<"users">) => void;
}) {
  const { user } = useUser();
  const users = useQuery(api.users.listActiveUsers, { limit: 100 });

  const directoryUsers = useMemo(() => {
    return (users || []).filter(
      (directoryUser) => directoryUser.userId !== user?.id,
    );
  }, [user?.id, users]);

  const directoryUserIds = useMemo(() => {
    return directoryUsers.map(u => u.userId);
  }, [directoryUsers]);

  const connectionStatuses = useQuery(
    api.friends.getConnectionStatuses,
    user?.id && directoryUserIds.length > 0
      ? { currentUserId: user.id, otherUserIds: directoryUserIds }
      : "skip"
  );

  const sendRequest = useMutation(api.friends.sendRequest);
  const acceptRequest = useMutation(api.friends.acceptRequest);

  const handleSendRequest = async (receiverId: string) => {
    if (!user?.id) return;
    await sendRequest({ senderId: user.id, receiverId });
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptRequest({ requestId: requestId as any });
  };

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          All Users
        </h2>
        {(users === undefined || (directoryUsers.length > 0 && connectionStatuses === undefined)) && <InlineSpinner size="sm" />}
      </div>

      {users === undefined ? (
        <div className="space-y-3">
          <div className="h-14 rounded-lg bg-muted" />
          <div className="h-14 rounded-lg bg-muted" />
          <div className="h-14 rounded-lg bg-muted" />
        </div>
      ) : directoryUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
          No other users are available yet.
        </div>
      ) : (
        <div className="rounded-lg border bg-card px-3">
          {directoryUsers.map((directoryUser) => {
            const statusObj = connectionStatuses?.[directoryUser.userId] || { status: "none" };
            
            return (
              <div className="relative" key={directoryUser._id}>
                <UserDirectoryItem 
                  onSelect={onSelectUser} 
                  user={directoryUser}
                  status={statusObj.status}
                  requestId={statusObj.requestId}
                  onSendRequest={handleSendRequest}
                  onAcceptRequest={handleAcceptRequest}
                />
                {activeUserId === directoryUser.userId && (
                  <div className="absolute inset-y-0 right-0 flex items-center bg-card pl-3">
                    <InlineSpinner size="sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MobileExploreTab({
  onOpenChat,
}: {
  onOpenChat: (channel: Channel) => void;
}) {
  const { user } = useUser();
  const createNewChat = useCreateNewChat();
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleDirectChat = async (selectedUser: Doc<"users">) => {
    if (!user?.id) return;

    try {
      setActiveUserId(selectedUser.userId);
      const channel = await createNewChat({
        createdBy: user.id,
        members: [user.id, selectedUser.userId],
      });

      onOpenChat(channel);
    } finally {
      setActiveUserId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background px-4 py-4">
      <div className="relative">
        <UserSearch
          className="max-w-none"
          onSelectUser={handleDirectChat}
          placeholder="Search users by name or email..."
        />
      </div>

      <Button
        className="mt-4 h-12 w-full justify-start gap-3 rounded-lg border bg-card text-card-foreground shadow-none hover:bg-accent"
        onClick={() => setIsGroupOpen(true)}
        variant="outline"
      >
        <UsersIcon className="h-5 w-5" />
        Create Group Chat
      </Button>

      <DirectoryErrorBoundary
        key={retryKey}
        fallback={
          <section className="mt-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              All Users
            </h2>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center">
              <p className="text-sm text-muted-foreground">
                User directory is temporarily unavailable. Search still works.
              </p>
              <Button
                className="mt-3 h-8 text-xs"
                onClick={() => setRetryKey((k) => k + 1)}
                size="sm"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </section>
        }
      >
        <MobileUserDirectory
          activeUserId={activeUserId}
          onSelectUser={handleDirectChat}
        />
      </DirectoryErrorBoundary>

      <MobileGroupSheet
        onOpenChange={setIsGroupOpen}
        onOpenChat={onOpenChat}
        open={isGroupOpen}
      />
    </div>
  );
}

function MobileBottomNav({
  activeTab,
  onSwitchTab,
}: {
  activeTab: MobileTab;
  onSwitchTab: (tab: MobileTab) => void;
}) {
  const items = [
    { icon: MessageCircleIcon, label: "Chats", tab: "chats" as const },
    { icon: Globe2Icon, label: "Explore", tab: "explore" as const },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <button
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              key={item.tab}
              onClick={() => onSwitchTab(item.tab)}
              type="button"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function FriendRequestsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useUser();
  const requests = useQuery(
    api.friends.getPendingRequests,
    user?.id ? { userId: user.id } : "skip"
  );
  const acceptRequest = useMutation(api.friends.acceptRequest);
  const rejectRequest = useMutation(api.friends.rejectRequest);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Friend Requests</SheetTitle>
          <SheetDescription>
            People who want to connect with you.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {!requests ? (
            <div className="flex justify-center p-4"><InlineSpinner /></div>
          ) : requests.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="flex items-center gap-3 rounded-lg border p-3">
                <Image
                  src={req.sender.imageUrl}
                  alt={req.sender.name}
                  width={40}
                  height={40}
                  className="rounded-full h-10 w-10 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{req.sender.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{req.sender.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon-sm"
                    onClick={() => acceptRequest({ requestId: req._id })}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8 rounded-full"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => rejectRequest({ requestId: req._id })}
                    className="h-8 w-8 rounded-full"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileDashboardShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const { channel, setActiveChannel } = useChatContext();
  const { user } = useUser();
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  const pendingRequests = useQuery(
    api.friends.getPendingRequests,
    user?.id ? { userId: user.id } : "skip"
  );

  const activeTab: MobileTab =
    searchParams.get("tab") === "explore" ? "explore" : "chats";
  const isChatView = searchParams.get("view") === "chat" && !!channel;

  useEffect(() => {
    if (isMobile && searchParams.get("view") !== "chat" && channel) {
      setActiveChannel(undefined);
    }
  }, [channel, isMobile, searchParams, setActiveChannel]);

  const handleSwitchTab = (tab: MobileTab) => {
    setActiveChannel(undefined);
    router.replace(`/dashboard?tab=${tab}`, { scroll: false });
  };

  const handleOpenChat = (nextChannel: Channel) => {
    setActiveChannel(nextChannel);
    window.history.replaceState(null, "", "/dashboard?tab=chats");
    router.push("/dashboard?view=chat", { scroll: false });
  };

  const handleBackToChats = () => {
    setActiveChannel(undefined);
    router.replace("/dashboard?tab=chats", { scroll: false });
  };

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background md:hidden">
      {isChatView ? (
        <div className="h-full min-h-0 overflow-hidden">
          <DashboardChatView onBack={handleBackToChats} showBackButton />
        </div>
      ) : (
        <>
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Gossip
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="relative text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsRequestsOpen(true)}
              >
                <BellIcon className="h-6 w-6" />
                {pendingRequests && pendingRequests.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <UserButton signInUrl="/sign-in" />
            </div>
          </header>

          <main className="min-h-0 flex-1 pb-[calc(env(safe-area-inset-bottom)+4.75rem)]">
            {activeTab === "chats" ? (
              <MobileChatsTab
                onOpenChat={handleOpenChat}
                onSwitchTab={handleSwitchTab}
              />
            ) : (
              <MobileExploreTab onOpenChat={handleOpenChat} />
            )}
          </main>

          <MobileBottomNav
            activeTab={activeTab}
            onSwitchTab={handleSwitchTab}
          />
          
          <FriendRequestsSheet 
            open={isRequestsOpen} 
            onOpenChange={setIsRequestsOpen} 
          />
        </>
      )}
    </div>
  );
}
