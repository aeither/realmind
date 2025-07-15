import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const sendToast = mutation({
  args: {
    message: v.string(),
    type: v.union(v.literal("success"), v.literal("error"), v.literal("info"), v.literal("warning")),
    userId: v.optional(v.string()),
    isGlobal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const triggeredBy = "Quiz Arena";
    
    await ctx.db.insert("notifications", {
      message: args.message,
      type: args.type,
      triggeredBy,
      userId: args.userId,
      isGlobal: args.isGlobal ?? false,
    });
  },
});

export const getRecentNotifications = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get notifications from the last 30 seconds to show as toasts
    const thirtySecondsAgo = Date.now() - 30000;
    
    const query = ctx.db
      .query("notifications")
      .withIndex("by_creation_time", (q) => 
        q.gt("_creationTime", thirtySecondsAgo)
      );

    // Filter by user if provided, otherwise get global notifications
    if (args.userId) {
      return await query
        .filter((q) => 
          q.or(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("isGlobal"), true)
          )
        )
        .order("desc")
        .take(20);
    } else {
      return await query
        .filter((q) => q.eq(q.field("isGlobal"), true))
        .order("desc")
        .take(20);
    }
  },
});

export const getUserNotifications = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const clearOldNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear notifications older than 5 minutes
    const fiveMinutesAgo = Date.now() - 300000;
    
    const oldNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_creation_time", (q) => 
        q.lt("_creationTime", fiveMinutesAgo)
      )
      .collect();

    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id);
    }
  },
}); 