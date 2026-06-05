"use client";

import { Button } from "@/components/ui/button";
import { useCallContext } from "@/components/call/CallProvider";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeftIcon,
  Loader2Icon,
  LogOutIcon,
  VideoIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  useChatContext,
  Window,
} from "stream-chat-react";
import { useState } from "react";

type DashboardChatViewProps = {
  emptyState?: React.ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
};

export function DashboardChatView({
  emptyState,
  onBack,
  showBackButton = false,
}: DashboardChatViewProps) {
  const { user } = useUser();
  const router = useRouter();
  const { channel, setActiveChannel } = useChatContext();
  const { startCall, callStatus } = useCallContext();
  const [isStartingCall, setIsStartingCall] = useState(false);

  const handleCall = async () => {
    if (!channel || !user?.id) return;

    try {
      setIsStartingCall(true);

      const members = Object.values(channel.state.members || {});
      const memberIds = members
        .map((member) => member.user_id)
        .filter(Boolean) as string[];

      if (memberIds.length < 2) {
        console.warn("Need at least 2 members to start a call");
        return;
      }

      await startCall(memberIds);
    } catch (error) {
      console.error("Failed to start call:", error);
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleLeaveChat = async () => {
    if (!channel || !user?.id) {
      console.log("No active channel or user");
      return;
    }

    const confirmLeave = window.confirm("Are you sure you want to leave the chat?");
    if (!confirmLeave) return;

    try {
      await channel.sendMessage({
        text: `${user.fullName || user.username || "A user"} has left the group.`,
      });

      await channel.removeMembers([user.id]);
      setActiveChannel(undefined);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving chat:", error);
    }
  };

  const isCallBusy = isStartingCall || callStatus !== "idle";

  if (!channel) {
    return (
      <>
        {emptyState ?? (
          <div className="flex h-full flex-col items-center justify-center">
            <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
              No chat selected
            </h2>
            <p className="text-muted-foreground">
              Select a chat from the sidebar or start a new conversation
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <Channel>
      <Window>
        <div className="flex items-center justify-between gap-2 border-b bg-background px-2 py-2 md:border-b-0 md:bg-transparent md:px-0 md:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {showBackButton && (
              <Button
                aria-label="Back to chats"
                className="shrink-0"
                onClick={onBack}
                size="icon-sm"
                variant="ghost"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              {channel.data?.member_count === 1 ? (
                <ChannelHeader title="Everyone else has left this chat!" />
              ) : (
                <ChannelHeader />
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              className="gap-2 px-3 sm:px-4"
              disabled={isCallBusy}
              onClick={handleCall}
              variant="outline"
            >
              {isStartingCall ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <VideoIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isStartingCall ? "Starting..." : "Video Call"}
              </span>
            </Button>
            <Button
              className="gap-2 px-3 text-red-500 hover:bg-red-50 hover:text-red-600 sm:px-4 dark:hover:bg-red-950"
              onClick={handleLeaveChat}
              variant="outline"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Leave Chat</span>
            </Button>
          </div>
        </div>
        <MessageList />
        <div className="sticky bottom-0 w-full">
          <MessageInput audioRecordingEnabled={true} />
        </div>
      </Window>
      <Thread additionalMessageInputProps={{ audioRecordingEnabled: true }} />
    </Channel>
  );
}
