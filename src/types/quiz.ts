export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizCard {
  id: number;
  title: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  quiz: Quiz;
}

export interface QuizData {
  totalTickets: number;
  todayTickets: number;
  completedQuizzes: number[];
  streak: number;
  lastPlayDate: string;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  type: string;
  icon: React.ReactNode;
  color: string;
  rarity: string;
} 