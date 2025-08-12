import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount, useDisconnect, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { getContractAddresses } from '../libs/constants';
import { quizGameABI } from '../libs/quizGameABI';
import { coreTestnet } from '../wagmi';

// Currency configuration for different chains
const CURRENCY_CONFIG = {
  1114: { // Core Testnet2
    symbol: 'CORE',
    multiplier: 1,
    defaultAmounts: ['0.1', '0.5', '2.5']
  },
  default: { // Fallback configuration
    symbol: 'CORE',
    multiplier: 1,
    defaultAmounts: ['0.1', '0.5', '2.5']
  }
} as const;

// Available quiz configurations
const QUIZ_CONFIGS = {
  'web3-basics': {
    id: 'web3-basics',
    title: 'Web3 Basics',
    description: 'Test your knowledge of blockchain fundamentals',
    questions: 5
  },
  'defi-fundamentals': {
    id: 'defi-fundamentals', 
    title: 'DeFi Fundamentals',
    description: 'Learn about decentralized finance protocols',
    questions: 5
  },
  'coredao': {
    id: 'coredao',
    title: 'Core DAO Ecosystem',
    description: 'Learn about the Core blockchain ecosystem',
    questions: 5
  }
} as const;

function QuizGameContract() {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(coreTestnet.id);
  
  // Get currency config for current chain
  const currencyConfig = chain ? (CURRENCY_CONFIG[chain.id as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.default) : CURRENCY_CONFIG.default;

  // State for quiz interaction (minimal state needed for this component)
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Contract reads
  const { data: userSession } = useReadContract({
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    abi: quizGameABI,
    functionName: 'getQuizSession',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const { data: hasActiveQuiz } = useReadContract({
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    abi: quizGameABI,
    functionName: 'hasActiveQuiz',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Extract quiz ID from user session
  const activeQuizId = userSession?.quizId || '';

  // Contract writes
  const { writeContract: startQuiz, isPending: isStartPending, data: startHash } = useWriteContract();
  const { writeContract: completeQuiz, isPending: isCompletePending, data: completeHash } = useWriteContract();

  // Wait for transaction receipts
  const { data: startReceipt, isSuccess: isStartSuccess } = useWaitForTransactionReceipt({
    hash: startHash,
  });

  const { data: completeReceipt, isSuccess: isCompleteSuccess } = useWaitForTransactionReceipt({
    hash: completeHash,
  });

  // Show quiz when start is successful
  useEffect(() => {
    if (isStartSuccess) {
      toast.success('Quiz started! Good luck! 🎮');
      setShowQuiz(true);
    }
  }, [isStartSuccess]);

  // Reset quiz when claim is successful
  useEffect(() => {
    if (isCompleteSuccess) {
      toast.success('Rewards claimed! Check your wallet 🎁');
    }
  }, [isCompleteSuccess]);



  // Check if user is on correct chain
  const supportedChainIds = [1114]; // Only Core Testnet2
  const isCorrectChain = chain ? supportedChainIds.includes(chain.id) : false;

  // If not on correct chain, show network switch options
  if (!isCorrectChain) {
    return (
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#ffffff", marginBottom: "1rem" }}>Wrong Network</h2>
        <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>
          Please switch to Core Testnet to play the quiz game.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
          <button 
            onClick={() => switchChain({ chainId: coreTestnet.id })}
            style={{
              backgroundColor: "#00ff87",
              color: "#0a0e0a",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Switch to Core Testnet
          </button>
        </div>
        <button 
          onClick={() => disconnect()}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // If user has active session, show the quiz
  if (hasActiveQuiz && activeQuizId) {
    const activeQuizConfig = QUIZ_CONFIGS[activeQuizId as keyof typeof QUIZ_CONFIGS];
    
    return (
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <div style={{
          background: "rgba(0, 255, 135, 0.1)",
          border: "1px solid rgba(0, 255, 135, 0.3)",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
          textAlign: "left"
        }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#00ff87" }}>🔄 Active Quiz Session</h4>
          <p style={{ margin: "0 0 1rem 0", color: "#ffffff", fontSize: "0.9rem" }}>
            You have an active quiz session: <strong>{activeQuizConfig?.title || activeQuizId}</strong>
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              to="/quiz-game"
              search={{ quiz: activeQuizId }}
              style={{
                backgroundColor: "#00ff87",
                color: "#0a0e0a",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "inline-block"
              }}
            >
              Continue Quiz
            </Link>
            <button
              onClick={() => {
                completeQuiz({
                  address: contractAddresses.quizGameContractAddress as `0x${string}`,
                  abi: quizGameABI,
                  functionName: 'completeQuiz',
                  args: [BigInt(Math.floor(Math.random() * 100) + 1)],
                });
              }}
              disabled={isCompletePending}
              style={{
                backgroundColor: isCompletePending ? "#374151" : "#ff4757",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: isCompletePending ? "not-allowed" : "pointer",
                transition: "all 0.3s ease"
              }}
            >
              {isCompletePending ? "Completing..." : "Complete Session"}
            </button>
          </div>
        </div>
      </div>
    );
  }



  // Main quiz interface
  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem"
    }}>
      <h1 style={{ 
        color: "#00ff87", 
        textAlign: "center", 
        marginBottom: "2rem",
        fontSize: "2.5rem",
        fontWeight: "bold"
      }}>
        🏛️ Realmind Quiz Game
      </h1>

      {/* Game Rules */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        border: "1px solid rgba(0, 255, 135, 0.2)"
      }}>
        <h3 style={{ color: "#00ff87", marginBottom: "1rem" }}>📋 How It Works:</h3>
        <ul style={{ 
          color: "#ffffff", 
          lineHeight: "1.6",
          paddingLeft: "1.5rem",
          margin: 0
        }}>
          <li>🎯 Choose a quiz topic below</li>
          <li>📝 Answer all questions in the quiz</li>
          <li>✅ Get all answers correct for bonus tokens (10-90%)</li>
          <li>🪙 Receive Token1 tokens equal to your entry fee × 100</li>
          <li>⏰ Complete within 1 hour of starting</li>
        </ul>
      </div>

      {/* Available Quizzes */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "12px",
        padding: "2rem",
        marginBottom: "2rem",
        border: "1px solid rgba(0, 255, 135, 0.2)"
      }}>
        <h3 style={{ color: "#00ff87", marginBottom: "1.5rem", textAlign: "center" }}>
          🎮 Select a Quiz
        </h3>
        
        <div style={{ 
          display: "grid", 
          gap: "1rem", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
        }}>
          {Object.values(QUIZ_CONFIGS).map((quiz) => (
            <Link
              key={quiz.id}
              to="/quiz-game"
              search={{ quiz: quiz.id }}
              style={{
                background: "rgba(0, 255, 135, 0.1)",
                border: "1px solid rgba(0, 255, 135, 0.3)",
                borderRadius: "8px",
                padding: "1.5rem",
                textDecoration: "none",
                transition: "all 0.3s ease",
                display: "block"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 255, 135, 0.2)";
                e.currentTarget.style.borderColor = "#00ff87";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 255, 135, 0.1)";
                e.currentTarget.style.borderColor = "rgba(0, 255, 135, 0.3)";
              }}
            >
              <h4 style={{ color: "#00ff87", marginBottom: "0.5rem" }}>{quiz.title}</h4>
              <p style={{ color: "#ffffff", fontSize: "0.9rem", margin: "0 0 0.5rem 0" }}>
                {quiz.description}
              </p>
              <p style={{ color: "#9ca3af", fontSize: "0.8rem", margin: 0 }}>
                {quiz.questions} questions
              </p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

export default QuizGameContract;
