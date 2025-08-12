import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import Header from '../components/Header'

interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: number;
  estimatedTime: string;
  category: string;
}

const AVAILABLE_QUIZZES: Quiz[] = [
  {
    id: "web3-basics",
    title: "Web3 Fundamentals",
    description: "Test your knowledge of blockchain, cryptocurrencies, and decentralized applications",
    icon: "🔗",
    questions: 5,
    estimatedTime: "3-5 min",
    category: "Web3"
  },
  {
    id: "crypto-trading",
    title: "Crypto Trading",
    description: "Learn about trading strategies, market analysis, and risk management",
    icon: "📈",
    questions: 5,
    estimatedTime: "3-5 min",
    category: "Finance"
  },
  {
    id: "defi-protocols",
    title: "DeFi Protocols",
    description: "Explore decentralized finance protocols, yield farming, and liquidity pools",
    icon: "🏦",
    questions: 5,
    estimatedTime: "3-5 min",
    category: "DeFi"
  }
];

function HomePage() {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuiz(quizId);
  };

  const handleRandomQuiz = () => {
    const randomIndex = Math.floor(Math.random() * AVAILABLE_QUIZZES.length);
    const randomQuiz = AVAILABLE_QUIZZES[randomIndex];
    setSelectedQuiz(randomQuiz.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        {/* Hero Section - Simplified Duolingo-like */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-3 text-foreground">
            Learn by Playing
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Short, fun quizzes to build real crypto knowledge. Pick a topic and start earning points.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRandomQuiz}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold quiz-button-glow hover:scale-105 transition-all"
            >
              Start a Random Quiz
            </button>
          </div>
        </div>

        {/* Quiz Selection Cards */}
        <div id="topics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {AVAILABLE_QUIZZES.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              isSelected={selectedQuiz === quiz.id}
              onSelect={() => handleQuizSelect(quiz.id)}
              delay={`${index * 200}ms`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          {selectedQuiz && (
            <div className="animate-bounce-in" style={{ animationDelay: '200ms' }}>
              <Link
                to="/quiz-game"
                search={{ quiz: selectedQuiz }}
                className="inline-block px-12 py-6 bg-gradient-primary text-primary-foreground 
                           rounded-3xl text-xl font-bold quiz-button-glow hover:scale-110 
                           transition-all duration-300 animate-pulse-glow"
              >
                🚀 Start Quiz
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizCard({ quiz, isSelected, onSelect, delay }: {
  quiz: Quiz;
  isSelected: boolean;
  onSelect: () => void;
  delay: string;
}) {
  return (
    <div
      onClick={onSelect}
      className={`quiz-card rounded-2xl p-6 cursor-pointer transition-all duration-300 animate-bounce-in group
                  ${isSelected 
                    ? 'ring-2 ring-primary quiz-glow scale-105' 
                    : 'hover:scale-105 hover:quiz-button-glow'
                  }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4 group-hover:animate-celebrate">
          {quiz.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">
            {quiz.title}
          </h3>
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {quiz.category}
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
        {quiz.description}
      </p>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span className="flex items-center">
          <span className="mr-1">📝</span>
          {quiz.questions} questions
        </span>
        <span className="flex items-center">
          <span className="mr-1">⏱️</span>
          {quiz.estimatedTime}
        </span>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})