import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Send a friend request
export const sendRequest = mutation({
  args: { receiverId: v.string(), senderId: v.string() },
  handler: async (ctx, { receiverId, senderId }) => {
    if (senderId === receiverId) throw new Error("Cannot send request to yourself");

    // Check if already friends
    const existingFriend = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", senderId).eq("friendId", receiverId)
      )
      .first();

    if (existingFriend) return;

    // Check if request already sent
    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender_receiver", (q) =>
        q.eq("senderId", senderId).eq("receiverId", receiverId)
      )
      .first();

    if (existingRequest) return;

    // Check if receiver already sent a request to sender (auto-accept logic could be here, but let's just create request for now)
    
    await ctx.db.insert("friendRequests", {
      senderId,
      receiverId,
    });
  },
});

// Accept a friend request
export const acceptRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, { requestId }) => {
    const request = await ctx.db.get(requestId);
    if (!request) return;

    // Create mutual friendship
    await ctx.db.insert("friends", {
      userId: request.senderId,
      friendId: request.receiverId,
    });
    
    await ctx.db.insert("friends", {
      userId: request.receiverId,
      friendId: request.senderId,
    });

    // Delete the request
    await ctx.db.delete(requestId);
  },
});

// Reject a friend request
export const rejectRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, { requestId }) => {
    await ctx.db.delete(requestId);
  },
});

// Get all pending incoming friend requests for a user
export const getPendingRequests = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .collect();

    // Fetch user details for each sender
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_userId", (q) => q.eq("userId", request.senderId))
          .first();
        return {
          ...request,
          sender,
        };
      })
    );

    return requestsWithUsers.filter((r) => r.sender !== null);
  },
});

// Get friendship status for a list of users relative to the current user
export const getConnectionStatuses = query({
  args: { currentUserId: v.string(), otherUserIds: v.array(v.string()) },
  handler: async (ctx, { currentUserId, otherUserIds }) => {
    const statuses: Record<string, { status: "friends" | "pending_sent" | "pending_received" | "none", requestId?: string }> = {};

    for (const otherUserId of otherUserIds) {
      if (currentUserId === otherUserId) continue;

      // Check if friends
      const isFriend = await ctx.db
        .query("friends")
        .withIndex("by_user_friend", (q) =>
          q.eq("userId", currentUserId).eq("friendId", otherUserId)
        )
        .first();

      if (isFriend) {
        statuses[otherUserId] = { status: "friends" };
        continue;
      }

      // Check if current user sent a request
      const sentRequest = await ctx.db
        .query("friendRequests")
        .withIndex("by_sender_receiver", (q) =>
          q.eq("senderId", currentUserId).eq("receiverId", otherUserId)
        )
        .first();

      if (sentRequest) {
        statuses[otherUserId] = { status: "pending_sent", requestId: sentRequest._id };
        continue;
      }

      // Check if current user received a request
      const receivedRequest = await ctx.db
        .query("friendRequests")
        .withIndex("by_sender_receiver", (q) =>
          q.eq("senderId", otherUserId).eq("receiverId", currentUserId)
        )
        .first();

      if (receivedRequest) {
        statuses[otherUserId] = { status: "pending_received", requestId: receivedRequest._id };
        continue;
      }

      statuses[otherUserId] = { status: "none" };
    }

    return statuses;
  },
});

