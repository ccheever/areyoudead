import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    token: v.string(), // Unique device ID or user token
    lastCheckIn: v.number(), // Timestamp of last "I'm Alive" press
    lastNotified: v.optional(v.number()), // Timestamp of last notification sent
    name: v.optional(v.string()),
  }).index("by_token", ["token"]),

  contacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
