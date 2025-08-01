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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Hero Section */}
      

      {/* Quiz Selection Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem",
        maxWidth: "1000px",
        width: "100%",
        marginBottom: "2rem"
      }}>
        {AVAILABLE_QUIZZES.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            isSelected={selectedQuiz === quiz.id}
            onSelect={() => handleQuizSelect(quiz.id)}
          />
        ))}
      </div>

      {/* Random Quiz Button */}
      <div style={{
        textAlign: "center",
        marginBottom: "2rem"
      }}>
        <button
          onClick={handleRandomQuiz}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            border: "2px solid rgba(255,255,255,0.3)",
            padding: "1rem 2rem",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          🎲 Try Random Quiz
        </button>
      </div>

      {/* Play Button */}
      {selectedQuiz && (
        <div style={{
          textAlign: "center"
        }}>
          <Link
            to="/quiz-game"
            search={{ quiz: selectedQuiz }}
            style={{
              display: "inline-block",
              backgroundColor: "#22c55e",
              color: "white",
              padding: "1.5rem 3rem",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "1.3rem",
              fontWeight: "bold",
              boxShadow: "0 8px 16px rgba(34, 197, 94, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#16a34a";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 20px rgba(34, 197, 94, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#22c55e";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(34, 197, 94, 0.3)";
            }}
          >
            🎮 Play Quiz
          </Link>
        </div>
      )}


    </div>
  );
}

function QuizCard({ quiz, isSelected, onSelect }: {
  quiz: Quiz;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "2rem",
        cursor: "pointer",
        border: isSelected ? "3px solid #22c55e" : "2px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        color: isSelected ? "#1f2937" : "white"
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "scale(1.02)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "1rem"
      }}>
        <div style={{
          fontSize: "2.5rem",
          marginRight: "1rem"
        }}>
          {quiz.icon}
        </div>
        <div>
          <h3 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem"
          }}>
            {quiz.title}
          </h3>
        </div>
      </div>
      
      <p style={{
        marginBottom: "1.5rem",
        lineHeight: "1.6",
        opacity: isSelected ? 0.8 : 0.9
      }}>
        {quiz.description}
      </p>
      
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.9rem",
        opacity: 0.8
      }}>
        <span>📝 {quiz.questions} questions</span>
        <span>⏱️ {quiz.estimatedTime}</span>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})