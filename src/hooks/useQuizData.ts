import type { QuizData } from "@/types/quiz";
import { useEffect, useState } from "react";

export const useQuizData = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [todayTickets, setTodayTickets] = useState(0);
  const [streak, setStreak] = useState(1);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("quizData");
    if (savedData) {
      const data: QuizData = JSON.parse(savedData);
      const today = new Date().toDateString();

      // Check if it's a new day
      if (data.lastPlayDate !== today) {
        // Reset daily progress but keep total tickets
        setTotalTickets(data.totalTickets || 0);
        setTodayTickets(0);
        setCompletedQuizzes([]);
        setStreak(data.streak || 1);

        // Save updated data
        localStorage.setItem(
          "quizData",
          JSON.stringify({
            totalTickets: data.totalTickets || 0,
            todayTickets: 0,
            completedQuizzes: [],
            streak: data.streak || 1,
            lastPlayDate: today,
          })
        );
      } else {
        // Same day, restore saved progress
        setTotalTickets(data.totalTickets || 0);
        setTodayTickets(data.todayTickets || 0);
        setCompletedQuizzes(data.completedQuizzes || []);
        setStreak(data.streak || 1);
      }
    }
  }, []);

  const handleQuizComplete = (quizId: number, tickets: number) => {
    const newCompletedQuizzes = [...completedQuizzes, quizId];
    const newTodayTickets = todayTickets + tickets;
    const newTotalTickets = totalTickets + tickets;
    const newStreak = newCompletedQuizzes.length === 3 ? streak + 1 : streak;

    setCompletedQuizzes(newCompletedQuizzes);
    setTodayTickets(newTodayTickets);
    setTotalTickets(newTotalTickets);
    setStreak(newStreak);

    // Save to localStorage
    const today = new Date().toDateString();
    const quizData: QuizData = {
      totalTickets: newTotalTickets,
      todayTickets: newTodayTickets,
      completedQuizzes: newCompletedQuizzes,
      streak: newStreak,
      lastPlayDate: today,
    };
    localStorage.setItem("quizData", JSON.stringify(quizData));
  };

  const resetCompletedQuizzes = () => {
    setCompletedQuizzes([]);
  };

  return {
    completedQuizzes,
    totalTickets,
    todayTickets,
    streak,
    handleQuizComplete,
    resetCompletedQuizzes,
  };
};
