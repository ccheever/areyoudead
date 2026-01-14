import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    token: v.string(), // Unique device ID or user token
    lastCheckIn: v.number(), // Timestamp of actual button press
    nextDeadline: v.optional(v.number()), // The absolute timestamp when the user "dies"
    lastNotified: v.optional(v.number()), // Timestamp of last notification sent (server-side for contacts)
    name: v.optional(v.string()),
    checkInHour: v.optional(v.number()), // Default 8
    checkInMinute: v.optional(v.number()), // Default 30
    debugMode: v.optional(v.string()), // "standard", "1min", "10sec"
  }).index("by_token", ["token"]),

  contacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
