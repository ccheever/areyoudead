import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const DEAD_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours
const NOTIFICATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export const getOverdueUsers = internalQuery({
  handler: async (ctx) => {
    const now = Date.now();
    const users = await ctx.db.query("users").collect();
    
    const overdueUsers = [];

    for (const user of users) {
      // Use nextDeadline if available, otherwise fallback to legacy 48h
      const deadline = user.nextDeadline ?? (user.lastCheckIn + DEAD_THRESHOLD);
      
      const isDead = now > deadline;
      const shouldNotify = !user.lastNotified || (now - user.lastNotified > NOTIFICATION_COOLDOWN);

      if (isDead && shouldNotify) {
        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        
        if (contacts.length > 0) {
            overdueUsers.push({ user, contacts });
        }
      }
    }

    return overdueUsers;
  },
});

export const markAsNotified = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastNotified: Date.now(),
    });
  },
});

export const checkDeadUsers = internalAction({
  handler: async (ctx) => {
    const overdue = await ctx.runQuery(internal.deadMan.getOverdueUsers);

    for (const { user, contacts } of overdue) {
      await ctx.runAction(internal.actions.sendNotifications, {
        contacts: contacts.map(c => ({
            name: c.name,
            email: c.email,
            phone: c.phone
        })),
        userName: user.name
      });

      await ctx.runMutation(internal.deadMan.markAsNotified, {
        userId: user._id
      });
    }
  },
});
