/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverClient } from "@/lib/streamServer";

export async function verifyAdmin(channelId: string, requesterId: string) {
  const channel = serverClient.channel("team", channelId);
  const state = await channel.watch();
  
  let adminIds = ((state.channel as any).adminIds as string[]) || [];
  const createdById = (state.channel as any).created_by_id || (state.channel as any).created_by?.id;
  
  // Fallback: If adminIds is empty, the creator is inherently an admin
  if (adminIds.length === 0 && createdById) {
    adminIds = [createdById];
  }
  
  if (!adminIds.includes(requesterId) && requesterId !== createdById) {
    throw new Error("Unauthorized: Only admins can perform this action");
  }
  
  return { channel, adminIds, state, createdById };
}

export async function addMembersToGroup(channelId: string, userIdsToAdd: string[], requesterId: string) {
  try {
    const { channel } = await verifyAdmin(channelId, requesterId);
    await channel.addMembers(userIdsToAdd);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add members:", error);
    return { success: false, error: error.message };
  }
}

export async function removeMemberFromGroup(channelId: string, targetUserId: string, requesterId: string) {
  try {
    const { channel, adminIds } = await verifyAdmin(channelId, requesterId);
    
    if (adminIds.includes(targetUserId)) {
      // If we are removing an admin, remove them from adminIds first
      const newAdminIds = adminIds.filter((id) => id !== targetUserId);
      await channel.updatePartial({ set: { adminIds: newAdminIds } as any });
    }
    
    await channel.removeMembers([targetUserId]);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove member:", error);
    return { success: false, error: error.message };
  }
}

export async function updateGroupRole(channelId: string, targetUserId: string, action: "promote" | "demote", requesterId: string) {
  try {
    const { channel, adminIds } = await verifyAdmin(channelId, requesterId);
    
    let newAdminIds = [...adminIds];
    
    if (action === "promote" && !newAdminIds.includes(targetUserId)) {
      newAdminIds.push(targetUserId);
    } else if (action === "demote" && newAdminIds.includes(targetUserId)) {
      newAdminIds = newAdminIds.filter((id) => id !== targetUserId);
    }
    
    await channel.updatePartial({ set: { adminIds: newAdminIds } as any });
    
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to ${action} user:`, error);
    return { success: false, error: error.message };
  }
}

export async function renameGroup(channelId: string, newName: string, requesterId: string) {
  try {
    const { channel } = await verifyAdmin(channelId, requesterId);
    
    await channel.updatePartial({ set: { name: newName } as any });
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to rename group:", error);
    return { success: false, error: error.message };
  }
}

export async function leaveGroup(channelId: string, userId: string) {
  try {
    const channel = serverClient.channel("team", channelId);
    const state = await channel.watch();
    const members = Object.keys(state.members);
    let adminIds = ((state.channel as any).adminIds as string[]) || [];
    const createdById = (state.channel as any).created_by_id || (state.channel as any).created_by?.id;
    
    if (adminIds.length === 0 && createdById) {
      adminIds = [createdById];
    }

    // If last person leaving, delete group
    if (members.length <= 1) {
      await channel.delete();
      return { success: true };
    }

    if (adminIds.includes(userId)) {
      adminIds = adminIds.filter((id) => id !== userId);
      
      // If no admins left, assign oldest member as admin
      if (adminIds.length === 0) {
        const otherMembers = Object.values(state.members)
          .filter(m => m.user_id !== userId)
          .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
          
        if (otherMembers.length > 0 && otherMembers[0].user_id) {
          adminIds.push(otherMembers[0].user_id);
        }
      }
      
      await channel.updatePartial({ set: { adminIds } as any });
    }
    
    await channel.removeMembers([userId]);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to leave group:", error);
    return { success: false, error: error.message };
  }
}
