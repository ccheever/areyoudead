import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendNotifications = internalAction({
  args: {
    contacts: v.array(
      v.object({
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
      })
    ),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This is where we would call Twilio or Resend.
    // For prototype, we will log to console.
    console.log("---------------------------------------------------");
    console.log(`🚨 DEAD MAN SWITCH TRIGGERED 🚨`);
    console.log(`User: ${args.userName || "Unknown User"}`);
    console.log("Notifying contacts:");
    
    for (const contact of args.contacts) {
        if (contact.email) {
            console.log(`📧 Sending EMAIL to ${contact.name} (${contact.email}): "Your friend might be dead."`);
        }
        if (contact.phone) {
            console.log(`📱 Sending SMS to ${contact.name} (${contact.phone}): "Your friend might be dead."`);
        }
    }
    console.log("---------------------------------------------------");

    return { success: true };
  },
});
