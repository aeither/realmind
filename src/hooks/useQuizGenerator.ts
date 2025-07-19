import { useToast } from "@/hooks/use-toast";
import type { QuizCard } from "@/types/quiz";
import { Brain, Calculator, Globe } from "lucide-react";
import React, { useState } from "react";

export const useQuizGenerator = (initialQuizzes: QuizCard[]) => {
  const [currentQuizzes, setCurrentQuizzes] = useState(initialQuizzes);
  const [quizTopic, setQuizTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateNewQuizzes = async () => {
    if (!quizTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for the new quizzes",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const icons = [Brain, Calculator, Globe];
    const colors = ["bg-primary", "bg-success", "bg-warning"];

    const newQuizzes: QuizCard[] = [1, 2, 3].map((id) => ({
      id,
      title: `${quizTopic} Quiz ${id}`,
      category: quizTopic,
      icon: React.createElement(icons[id - 1], {
        className: "w-6 h-6 text-white",
      }),
      color: colors[id - 1],
      quiz: {
        question: `Generated question about ${quizTopic} #${id}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: Math.floor(Math.random() * 4),
      },
    }));

    setCurrentQuizzes(newQuizzes);
    setQuizTopic("");
    setIsGenerating(false);

    toast({
      title: "New Quizzes Generated! ✨",
      description: `Created 3 new quizzes about ${quizTopic}`,
    });

    return newQuizzes;
  };

  return {
    currentQuizzes,
    quizTopic,
    setQuizTopic,
    isGenerating,
    generateNewQuizzes,
  };
};
