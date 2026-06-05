/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChatContext } from "stream-chat-react";

export const useCreateNewChat = () => {
  const { client } = useChatContext();

  const createNewChat = async ({
    members,
    createdBy,
    groupName,
  }: {
    members: string[];
    createdBy: string;
    groupName?: string; // Optional group name for group chats
  }) => {
    const isGroupChat = members.length > 2; // More than 2 people = group chat

    try {
      // Create channel with appropriate configuration for group vs 1-1 chat
      const channelData: {
        members: string[];
        created_by_id: string;
        name?: string;
      } = {
        members,
        created_by_id: createdBy,
      };

      // For group chats, add group-specific metadata
      if (isGroupChat) {
        channelData.name =
          groupName || `Group chat (${members.length} members)`;
        // Store admin privileges in custom channel data
        (channelData as any).adminIds = [createdBy];
      }

      const channel = isGroupChat
        ? client.channel(
            "team",
            `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
            channelData
          )
        : client.channel("messaging", {
            members,
            created_by_id: createdBy,
          });

      await channel.watch({
        presence: true,
      });

      return channel;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  };
  return createNewChat;
};
