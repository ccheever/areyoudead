import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (user) {
      return user;
    }

    // Default 8:30 AM
    const now = new Date();
    // Logic: If created today, set deadline to "Tomorrow 8:30 AM + 24h Grace"? 
    // Or just set a safe default. Let's set it to 48h from now roughly, anchored to 8:30.
    // For simplicity, let's just use the client to calculate the precise deadline on first check-in.
    // We initiate with a safe 48h buffer.
    
    const userId = await ctx.db.insert("users", {
      token: args.token,
      lastCheckIn: Date.now(),
      checkInHour: 8,
      checkInMinute: 30,
      nextDeadline: Date.now() + (48 * 60 * 60 * 1000), 
    });

    return await ctx.db.get(userId);
  },
});

export const checkIn = mutation({
  args: { 
    token: v.string(),
    nextDeadline: v.optional(v.number()) // Client calculates this based on local time
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const patch: any = {
      lastCheckIn: Date.now(),
    };

    if (args.nextDeadline) {
        patch.nextDeadline = args.nextDeadline;
    }

    await ctx.db.patch(user._id, patch);
  },
});

export const updateSettings = mutation({
    args: {
        token: v.string(),
        checkInHour: v.number(),
        checkInMinute: v.number(),
        debugMode: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!user) throw new Error("User not found");

        const patch: any = {
            checkInHour: args.checkInHour,
            checkInMinute: args.checkInMinute
        };

        if (args.debugMode) {
            patch.debugMode = args.debugMode;
        }

        await ctx.db.patch(user._id, patch);
    }
});

export const getUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});
