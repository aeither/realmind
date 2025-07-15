import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveQuizzes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

export const createQuiz = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
  },
  handler: async (ctx, args) => {
    const quizId = await ctx.db.insert("quizzes", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
    return quizId;
  },
});

export const getUserProgress = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      // Create default progress for new user
      return {
        totalTickets: 0,
        todayTickets: 0,
        streak: 0,
        completedQuizzes: [],
        lastPlayDate: new Date().toDateString(),
      };
    }

    return progress;
  },
});

export const updateUserProgress = mutation({
  args: {
    userId: v.string(),
    totalTickets: v.number(),
    todayTickets: v.number(),
    streak: v.number(),
    completedQuizzes: v.array(v.string()),
    lastPlayDate: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("userProgress", {
        userId: args.userId,
        ...args,
      });
    }
  },
});

export const recordQuizAttempt = mutation({
  args: {
    userId: v.string(),
    quizId: v.string(),
    isCorrect: v.boolean(),
    timeSpent: v.number(),
    ticketsEarned: v.number(),
    tokensEarned: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizAttempts", {
      ...args,
      answeredAt: Date.now(),
    });
  },
});

export const getWalletTransactions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const recordWalletTransaction = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("deposit"), v.literal("withdrawal"), v.literal("reward")),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("walletTransactions", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const claimReward = mutation({
  args: {
    userId: v.string(),
    rewardName: v.string(),
    rewardType: v.string(),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("claimedRewards", {
      ...args,
      claimedAt: Date.now(),
    });
  },
}); 