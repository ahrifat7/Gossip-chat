"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useCallContext } from "@/components/call/CallProvider";
import { useUser } from "@clerk/nextjs";
import { LogOutIcon, VideoIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Channel,
  useChatContext,
  Thread,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
} from "stream-chat-react";

function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const { channel, setActiveChannel } = useChatContext();
  const { startCall, callStatus } = useCallContext();
  const [isStartingCall, setIsStartingCall] = useState(false);

  const handleCall = async () => {
    if (!channel || !user?.id) return;

    try {
      setIsStartingCall(true);

      // Get all member IDs from the channel (including current user)
      const members = Object.values(channel.state.members || {});
      const memberIds = members.map((m) => m.user_id).filter(Boolean) as string[];

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

    // Confirm before leaving
    const confirm = window.confirm("Are you sure you want to leave the chat?");
    if (!confirm) return;

    try {
      // Send a notification message before leaving
      await channel.sendMessage({
        text: `${user.fullName || user.username || "A user"} has left the group.`,
      });

      // Remove current user from the channel
      await channel.removeMembers([user.id]);

      // Clear the active channel
      setActiveChannel(undefined);

      // Redirect to dashboard after leaving
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving chat:", error);
      // You could add a toast notification here for better UX
    }
  };

  const isCallBusy = isStartingCall || callStatus !== "idle";

  return (
    <div className="flex flex-col w-full flex-1 h-full overflow-hidden">
      {channel ? (
        <Channel>
          <Window>
            <div className="flex items-center justify-between">
              {channel.data?.member_count === 1 ? (
                <ChannelHeader title="Everyone else has left this chat!" />
              ) : (
                <ChannelHeader />
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCall}
                  disabled={isCallBusy}
                  className="gap-2 px-3 sm:px-4"
                >
                  {isStartingCall ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <VideoIcon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isStartingCall ? "Starting..." : "Video Call"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLeaveChat}
                  className="gap-2 px-3 sm:px-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOutIcon className="w-4 h-4" />
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
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
            No chat selected
          </h2>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or start a new conversation
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

