import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useConvexQuiz = (userId?: string) => {
  const { toast } = useToast();
  
  // Queries
  const activeQuizzes = useQuery(api.quiz.getActiveQuizzes);
  const userProgress = useQuery(api.quiz.getUserProgress, userId ? { userId } : "skip");
  const walletTransactions = useQuery(api.quiz.getWalletTransactions, userId ? { userId } : "skip");

  // Mutations
  const createQuiz = useMutation(api.quiz.createQuiz);
  const updateUserProgress = useMutation(api.quiz.updateUserProgress);
  const recordQuizAttempt = useMutation(api.quiz.recordQuizAttempt);
  const recordWalletTransaction = useMutation(api.quiz.recordWalletTransaction);
  const claimReward = useMutation(api.quiz.claimReward);
  const sendToast = useMutation(api.notifications.sendToast);

  const handleQuizComplete = async (
    quizId: string,
    isCorrect: boolean,
    timeSpent: number,
    ticketsEarned: number,
    tokensEarned: number
  ) => {
    if (!userId) return;

    try {
      // Record the quiz attempt
      await recordQuizAttempt({
        userId,
        quizId,
        isCorrect,
        timeSpent,
        ticketsEarned,
        tokensEarned,
      });

      // Update user progress
      const currentProgress = userProgress || {
        totalTickets: 0,
        todayTickets: 0,
        streak: 0,
        completedQuizzes: [],
        lastPlayDate: new Date().toDateString(),
      };

      const today = new Date().toDateString();
      const isNewDay = currentProgress.lastPlayDate !== today;
      
      const newCompletedQuizzes = isCorrect 
        ? [...currentProgress.completedQuizzes, quizId]
        : currentProgress.completedQuizzes;
      
      const newTodayTickets = isNewDay 
        ? ticketsEarned 
        : currentProgress.todayTickets + ticketsEarned;
      
      const newTotalTickets = currentProgress.totalTickets + ticketsEarned;
      const newStreak = newCompletedQuizzes.length === 3 ? currentProgress.streak + 1 : currentProgress.streak;

      await updateUserProgress({
        userId,
        totalTickets: newTotalTickets,
        todayTickets: newTodayTickets,
        streak: newStreak,
        completedQuizzes: newCompletedQuizzes,
        lastPlayDate: today,
      });

      // Record wallet transaction if tokens earned
      if (tokensEarned > 0) {
        await recordWalletTransaction({
          userId,
          type: "reward",
          amount: tokensEarned,
          description: `Quiz reward for ${isCorrect ? "correct" : "participation"}`,
        });
      }

      // Send notification
      await sendToast({
        message: isCorrect 
          ? `Correct! You earned ${ticketsEarned} tickets and ${tokensEarned} QT tokens!`
          : "Better luck next time!",
        type: isCorrect ? "success" : "info",
        userId,
      });

    } catch (error) {
      console.error("Error recording quiz completion:", error);
      toast({
        title: "Error",
        description: "Failed to save your progress",
        variant: "destructive",
      });
    }
  };

  const handleWalletDeposit = async (amount: number) => {
    if (!userId) return false;

    try {
      await recordWalletTransaction({
        userId,
        type: "deposit",
        amount: -amount, // Negative for deposits (money going out)
        description: `Deposit ${amount} QT tokens for quiz`,
      });

      await sendToast({
        message: `Deposited ${amount} QT tokens successfully!`,
        type: "success",
        userId,
      });

      return true;
    } catch (error) {
      console.error("Error recording deposit:", error);
      toast({
        title: "Error",
        description: "Failed to record deposit",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleClaimReward = async (rewardName: string, rewardType: string, cost: number) => {
    if (!userId) return;

    try {
      await claimReward({
        userId,
        rewardName,
        rewardType,
        cost,
      });

      await sendToast({
        message: `Successfully claimed ${rewardName}!`,
        type: "success",
        userId,
      });
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  return {
    // Data
    activeQuizzes,
    userProgress,
    walletTransactions,
    
    // Actions
    handleQuizComplete,
    handleWalletDeposit,
    handleClaimReward,
    createQuiz,
    sendToast,
  };
}; 