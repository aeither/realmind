import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ fid: number; displayName?: string; username?: string; pfpUrl?: string } | null>(
    null,
  );
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const context = await sdk.context;
        if (context.user) {
          setUser(context.user);
          const { token } = await sdk.quickAuth.getToken();
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
        sdk.actions.ready();
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, textAlign: "center" }}>
        <h1>🧠 RealMind</h1>
        {user ? <AuthenticatedView user={user} token={authToken} /> : <AuthenticationPrompt onAuth={setUser} />}
      </div>
      {user && <ConnectMenu />}
    </div>
  );
}

function SplashScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        🧠 RealMind
      </div>
      <div
        style={{
          fontSize: "1.2rem",
          marginBottom: "2rem",
          opacity: 0.9,
          textAlign: "center",
        }}
      >
        Interactive Learning Experience
      </div>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(255,255,255,0.3)",
          borderTop: "3px solid white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "0.75rem 1rem",
        fontSize: "0.85rem",
        color: "#6b7280",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        maxWidth: "250px",
        wordBreak: "break-all"
      }}>
        <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>💳 Connected</div>
        <div>{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "1rem",
      right: "1rem",
    }}>
      <button 
        type="button" 
        onClick={() => connect({ connector: connectors[0] })}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 12px -1px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
        }}
      >
        💳 Connect Wallet
      </button>
    </div>
  );
}

function AuthenticatedView({
  user,
  token,
}: { user: { fid: number; displayName?: string; username?: string; pfpUrl?: string }; token: string | null }) {
  const [activeView, setActiveView] = useState<'home' | 'quiz'>('home');

  if (activeView === 'quiz') {
    return <QuizGame onExit={() => setActiveView('home')} user={user} />;
  }

  return (
    <div style={{ margin: "2rem 0", padding: "1rem", backgroundColor: "#f0f8ff", borderRadius: "8px" }}>
      <h3>Welcome, {user.displayName || user.username}!</h3>
      <p>FID: {user.fid}</p>
      {user.pfpUrl && (
        <img
          src={user.pfpUrl}
          alt="Profile"
          style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "1rem 0" }}
        />
      )}
      
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
        <button
          type="button"
          style={{
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
          onClick={() => setActiveView('quiz')}
        >
          Take Quiz 🚀
        </button>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f0f9ff", borderRadius: "8px" }}>
        <h4>🎯 Learn & Earn</h4>
        <p>Complete daily quizzes and quests to earn points. Build your knowledge and compete with others!</p>
        <ul style={{ textAlign: "left", marginTop: "1rem" }}>
          <li>📚 Daily personalized quizzes</li>
          <li>🗺️ Special learning quests</li>
          <li>🏆 Leaderboard competitions</li>
          <li>🍋 Earn Yuzu Points for EDU Chain</li>
        </ul>
      </div>

      {token && <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "1rem" }}>Authenticated ✅</p>}
    </div>
  );
}

function AuthenticationPrompt({
  onAuth,
}: { onAuth: (user: { fid: number; displayName?: string; username?: string; pfpUrl?: string }) => void }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await sdk.actions.signIn({
        nonce: crypto.randomUUID(),
        acceptAuthAddress: true,
      });

      const context = await sdk.context;
      if (context.user) {
        onAuth(context.user);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      alert("Sign in failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div style={{ margin: "2rem 0", padding: "2rem", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
      <h3>Welcome to RealMind!</h3>
      <p>Sign in with your Farcaster account to start learning and earning points through interactive quizzes.</p>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isAuthenticating}
        style={{
          backgroundColor: isAuthenticating ? "#ccc" : "#8b5cf6",
          color: "white",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: isAuthenticating ? "not-allowed" : "pointer",
          marginTop: "1rem",
        }}
      >
        {isAuthenticating ? "Signing in..." : "Sign in with Farcaster"}
      </button>
    </div>
  );
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the native token of the Base network?",
    options: ["ETH", "BASE", "USD", "BTC"],
    correctAnswer: 0,
    explanation: "Base uses ETH as its native token, just like Ethereum mainnet.",
  },
  {
    id: 2,
    question: "Which company developed the Base blockchain?",
    options: ["Meta", "Coinbase", "Google", "OpenSea"],
    correctAnswer: 1,
    explanation: "Base is an Ethereum Layer 2 blockchain developed by Coinbase.",
  },
  {
    id: 3,
    question: "What type of blockchain is Base?",
    options: ["Layer 1", "Layer 2", "Sidechain", "Private"],
    correctAnswer: 1,
    explanation: "Base is a Layer 2 blockchain built on top of Ethereum using Optimism's OP Stack.",
  },
  {
    id: 4,
    question: "What is the purpose of Open Campus EDU Chain?",
    options: ["DeFi protocol", "Educational ecosystem", "NFT marketplace", "Gaming platform"],
    correctAnswer: 1,
    explanation: "EDU Chain is a blockchain designed specifically for decentralized education and learning rewards.",
  },
  {
    id: 5,
    question: "What are Yuzu Points used for?",
    options: ["Trading fees", "EDU token rewards", "Gas payments", "Voting rights"],
    correctAnswer: 1,
    explanation: "Yuzu Points can be converted to EDU tokens and used for various rewards in the Open Campus ecosystem.",
  },
];

function QuizGame({
  onExit,
  user,
}: {
  user: { fid: number; displayName?: string; username?: string; pfpUrl?: string };
  onExit: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === SAMPLE_QUESTIONS.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / SAMPLE_QUESTIONS.length) * 100);
    return (
      <div
        style={{
          margin: "2rem 0",
          padding: "2rem",
          backgroundColor: "#f0f8ff",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h2>🎉 Quiz Completed!</h2>
        <div style={{ fontSize: "3rem", margin: "1rem 0" }}>
          {percentage >= 80 ? "🏆" : percentage >= 60 ? "🥈" : "📚"}
        </div>
        <h3>
          Your Score: {score}/{SAMPLE_QUESTIONS.length}
        </h3>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          {percentage}% - {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep learning!"}
        </p>

        <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#e6f7ff", borderRadius: "8px" }}>
          <h4>🍋 Points Earned!</h4>
          <p>You earned <strong>{score * 10}</strong> learning points this session.</p>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Keep completing quizzes to build your leaderboard ranking and earn Yuzu Points!
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
          <button
            type="button"
            onClick={handleRestart}
            style={{
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Play Again 🔄
          </button>
          <button
            type="button"
            onClick={onExit}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Exit Quiz
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentQuestionIndex + 1) / SAMPLE_QUESTIONS.length) * 100;

  return (
    <div className="quiz-card">
      <div className="quiz-progress">
        <div className="quiz-progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="quiz-question">{currentQuestion.question}</div>
      <div className="quiz-options">
        {currentQuestion.options.map((option, index) => {
          let btnClass = "quiz-option-btn";
          if (selectedAnswer !== null) {
            if (index === currentQuestion.correctAnswer) btnClass += " correct";
            else if (index === selectedAnswer) btnClass += " incorrect";
          } else if (index === selectedAnswer) btnClass += " selected";
          return (
            <button
              key={`option-${currentQuestion.id}-${index}`}
              type="button"
              className={btnClass}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="quiz-slide-indicator">
        {currentQuestionIndex + 1} of {SAMPLE_QUESTIONS.length} Questions
      </div>
      {showExplanation && (
        <div style={{ margin: '1.5rem 0', color: '#0c4a6e', background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '1rem' }}>
          <strong>Explanation:</strong> {currentQuestion.explanation}
        </div>
      )}
      {showExplanation && (
        <button
          type="button"
          className="quiz-submit-btn"
          onClick={handleNext}
        >
          {isLastQuestion ? "Finish Quiz" : "Next Question"}
        </button>
      )}
    </div>
  );
}

export default App;
