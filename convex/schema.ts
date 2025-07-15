import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Quiz data table
  quizzes: defineTable({
    title: v.string(),
    category: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["isActive"]),

  // User progress and stats
  userProgress: defineTable({
    userId: v.string(),
    totalTickets: v.number(),
    todayTickets: v.number(),
    streak: v.number(),
    completedQuizzes: v.array(v.string()), // quiz IDs
    lastPlayDate: v.string(),
  }).index("by_user", ["userId"]),

  // Quiz attempts and results
  quizAttempts: defineTable({
    userId: v.string(),
    quizId: v.string(),
    isCorrect: v.boolean(),
    timeSpent: v.number(),
    ticketsEarned: v.number(),
    tokensEarned: v.number(),
    answeredAt: v.number(),
  }).index("by_user", ["userId"]).index("by_quiz", ["quizId"]),

  // Real-time notifications
  notifications: defineTable({
    message: v.string(),
    type: v.union(v.literal("success"), v.literal("error"), v.literal("info"), v.literal("warning")),
    triggeredBy: v.optional(v.string()),
    userId: v.optional(v.string()), // for user-specific notifications
    isGlobal: v.boolean(), // for global notifications
  }).index("by_creation_time", ["_creationTime"]).index("by_user", ["userId"]),

  // Rewards claimed by users
  claimedRewards: defineTable({
    userId: v.string(),
    rewardName: v.string(),
    rewardType: v.string(),
    cost: v.number(),
    claimedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Wallet transactions
  walletTransactions: defineTable({
    userId: v.string(),
    type: v.union(v.literal("deposit"), v.literal("withdrawal"), v.literal("reward")),
    amount: v.number(),
    description: v.string(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]).index("by_timestamp", ["timestamp"]),
}); 