import type { QuizCard } from "@/types/quiz";
import { Brain, Calculator, Globe } from "lucide-react";
import React from "react";

export const initialQuizzes: QuizCard[] = [
  {
    id: 1,
    title: "Brain Teaser",
    category: "Logic",
    icon: React.createElement(Brain, { className: "w-6 h-6 text-white" }),
    color: "bg-primary",
    quiz: {
      question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",
      options: ["40", "42", "44", "46"],
      correctAnswer: 1,
    },
  },
  {
    id: 2,
    title: "Math Challenge",
    category: "Mathematics",
    icon: React.createElement(Calculator, { className: "w-6 h-6 text-white" }),
    color: "bg-success",
    quiz: {
      question: "If 3x + 7 = 22, what is the value of x?",
      options: ["3", "5", "7", "9"],
      correctAnswer: 1,
    },
  },
  {
    id: 3,
    title: "World Facts",
    category: "Geography",
    icon: React.createElement(Globe, { className: "w-6 h-6 text-white" }),
    color: "bg-warning",
    quiz: {
      question: "Which country has the most time zones?",
      options: ["Russia", "USA", "China", "France"],
      correctAnswer: 3,
    },
  },
];
