import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 👤 Users synced from Clerk
  users: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  // 🤝 Pending Friend Requests
  friendRequests: defineTable({
    senderId: v.string(), // Clerk user ID
    receiverId: v.string(), // Clerk user ID
  })
    .index("by_receiver", ["receiverId"])
    .index("by_receiver_sender", ["receiverId", "senderId"])
    .index("by_sender_receiver", ["senderId", "receiverId"]),

  // 🧑‍🤝‍🧑 Established Friendships
  friends: defineTable({
    userId: v.string(), // Clerk user ID
    friendId: v.string(), // Clerk user ID
  })
    .index("by_user", ["userId"])
    .index("by_user_friend", ["userId", "friendId"]),
});
