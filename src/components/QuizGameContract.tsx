import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useDisconnect } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { quizGameABI } from '../libs/quizGameABI';
import { getContractAddresses } from '../libs/constants';
import { hyperionTestnet, coreDaoTestnet } from '../wagmi';

// Currency configuration for different chains
const CURRENCY_CONFIG = {
  133717: { // Hyperion Testnet
    symbol: 'tMETIS',
    multiplier: 1,
    defaultAmounts: ['1', '5', '25']
  },
  12345: { // EduChain
    symbol: 'EDU',
    multiplier: 1000, // EDU worth way less
    defaultAmounts: ['1', '5', '25']
  },
  1114: { // Core DAO Testnet
    symbol: 'tCORE',
    multiplier: 1,
    defaultAmounts: ['1', '5', '25']
  },
  default: { // All other chains (Sepolia, Base, etc.)
    symbol: 'ETH',
    multiplier: 1,
    defaultAmounts: ['0.001', '0.005', '0.025']
  }
} as const;

function QuizGameContract() {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(hyperionTestnet.id);
  
  // Get currency config for current chain
  const currencyConfig = chain ? (CURRENCY_CONFIG[chain.id as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.default) : CURRENCY_CONFIG[133717];

  // State for quiz interaction
  const [selectedAmount, setSelectedAmount] = useState<string>(currencyConfig.defaultAmounts[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Contract reads
  const { data: userSession } = useReadContract({
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    abi: quizGameABI,
    functionName: 'userSessions',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

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
      setShowQuiz(true);
    }
  }, [isStartSuccess]);

  // Quiz questions
  const questions = [
    {
      question: "What is the primary purpose of a blockchain?",
      options: ["To store data", "To create a decentralized, immutable ledger", "To process payments", "To host websites"],
      correct: 1
    },
    {
      question: "What does 'HODL' mean in cryptocurrency?",
      options: ["Hold On for Dear Life", "Hold", "High Order Data Logic", "Hash of Digital Ledger"],
      correct: 1
    },
    {
      question: "What is a smart contract?",
      options: ["A legal document", "Self-executing code on blockchain", "A cryptocurrency", "A wallet"],
      correct: 1
    },
    {
      question: "What is the 'blockchain trilemma'?",
      options: ["Security, Speed, Cost", "Decentralization, Scalability, Security", "Privacy, Speed, Cost", "Security, Privacy, Speed"],
      correct: 1
    },
    {
      question: "What is a 'gas fee' in Ethereum?",
      options: ["A tax", "Payment for computational work", "A transaction fee", "All of the above"],
      correct: 3
    }
  ];

  // Handle amount selection
  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  // Handle custom amount input
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(value);
  };

  // Get the actual amount to send (in ETH)
  const getActualAmount = () => {
    const amount = customAmount || selectedAmount;
    const ethAmount = parseFloat(amount) / currencyConfig.multiplier;
    return parseEther(ethAmount.toString());
  };

  // Handle start quiz
  const handleStartQuiz = () => {
    if (!address) return;
    
    const actualAmount = getActualAmount();
    const userAnswerValue = BigInt(Math.floor(Math.random() * 100) + 1);
    
    startQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'startQuiz',
      args: [userAnswerValue],
      value: actualAmount,
    });
  };

  // Handle complete quiz
  const handleCompleteQuiz = (answer?: number) => {
    if (!address) return;
    
    const answerToSubmit = BigInt(answer ?? Math.floor(Math.random() * 100) + 1);
    
    completeQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'completeQuiz',
      args: [answerToSubmit],
    });
  };

  // Handle quiz answer submission
  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed - submit to blockchain
      const correctAnswer = questions[currentQuestionIndex].options[questions[currentQuestionIndex].correct];
      const isCorrect = answer === correctAnswer;
      
      // Calculate final score
      const finalScore = newAnswers.reduce((score, ans, index) => {
        return score + (ans === questions[index].options[questions[index].correct] ? 1 : 0);
      }, 0) + (isCorrect ? 1 : 0);
      
      setScore(finalScore);
      setQuizCompleted(true);
      
      // Submit to blockchain with the original user answer
      handleCompleteQuiz(Math.floor(Math.random() * 100) + 1);
    }
  };

  // Reset quiz state
  const resetQuiz = () => {
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setScore(0);
    setUserAnswer('');
    setSubmittedAnswer('');
  };

  // Check if user is on correct chain
  const supportedChainIds = [133717, 11155111, 8453, 12345, 1114];
  const isCorrectChain = chain ? supportedChainIds.includes(chain.id) : false;

  // Check if user has active session
  const hasActiveSession = userSession && userSession[0];

  // If not on correct chain, show network switch options
  if (!isCorrectChain) {
    return (
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#1f2937", marginBottom: "1rem" }}>Wrong Network</h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          Please switch to one of the supported networks to play the quiz game.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
          <button 
            onClick={() => switchChain({ chainId: hyperionTestnet.id })}
            style={{
              backgroundColor: "#667eea",
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
            Switch to Hyperion Testnet
          </button>
          <button 
            onClick={() => switchChain({ chainId: coreDaoTestnet.id })}
            style={{
              backgroundColor: "#667eea",
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
            Switch to Core DAO Testnet
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
  if (hasActiveSession) {
    return (
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <div style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
          textAlign: "left"
        }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#92400e" }}>🔄 Active Session Found</h4>
          <p style={{ margin: "0 0 1rem 0", color: "#92400e", fontSize: "0.9rem" }}>
            You have an active quiz session. Continue playing or complete it to start a new one.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowQuiz(true)}
              style={{
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              Continue Quiz
            </button>
            <button
              onClick={() => handleCompleteQuiz()}
              disabled={isCompletePending}
              style={{
                backgroundColor: isCompletePending ? "#9ca3af" : "#ef4444",
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
              {isCompletePending ? "Confirming..." : "Complete Session"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If quiz is completed, show results
  if (quizCompleted) {
    return (
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#1f2937", marginBottom: "1rem" }}>Quiz Completed!</h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          You scored {score} out of {questions.length} questions correctly.
        </p>
        <button
          onClick={resetQuiz}
          style={{
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Play Again
        </button>
      </div>
    );
  }

  // If quiz is active, show current question
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#1f2937", marginBottom: "2rem" }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          marginBottom: "2rem"
        }}>
          <h3 style={{ color: "#1f2937", marginBottom: "1.5rem" }}>{currentQuestion.question}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuizAnswer(option)}
                style={{
                  backgroundColor: "#f8fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "1rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={resetQuiz}
          style={{
            backgroundColor: "#6b7280",
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
          Cancel Quiz
        </button>
      </div>
    );

  // Main quiz interface
  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem"
    }}>
      <h1 style={{ 
        color: "#1f2937", 
        textAlign: "center", 
        marginBottom: "2rem",
        fontSize: "2.5rem",
        fontWeight: "bold"
      }}>
        🧠 RealMind Quiz Game
      </h1>

      {/* Game Rules */}
      <div style={{
        background: "#f8fafc",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        border: "1px solid #e2e8f0"
      }}>
        <h3 style={{ color: "#1f2937", marginBottom: "1rem" }}>📋 Game Rules:</h3>
        <ul style={{ 
          color: "#4b5563", 
          lineHeight: "1.6",
          paddingLeft: "1.5rem",
          margin: 0
        }}>
          <li>📝 Answer 5 blockchain knowledge questions</li>
          <li>✅ Answer correctly to earn extra bonus tokens (10-90% bonus)</li>
          <li>🪙 Receive base Token1 tokens equal to your entry fee × 100</li>
          <li>⏰ Complete within 1 hour of starting</li>
        </ul>
      </div>

      {/* Entry Amount Selection */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem"
      }}>
        <h3 style={{ color: "#1f2937", marginBottom: "1.5rem", textAlign: "center" }}>
          💰 Select Entry Amount
        </h3>
        
        {/* Predefined amounts */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          justifyContent: "center", 
          marginBottom: "1.5rem",
          flexWrap: "wrap"
        }}>
          {currencyConfig.defaultAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              style={{
                backgroundColor: selectedAmount === amount ? "#667eea" : "white",
                color: selectedAmount === amount ? "white" : "#374151",
                border: `2px solid ${selectedAmount === amount ? "#667eea" : "#d1d5db"}`,
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              {amount} {currencyConfig.symbol}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ textAlign: "center" }}>
          <label style={{ 
            display: "block", 
            color: "#374151", 
            marginBottom: "0.5rem",
            fontWeight: "500"
          }}>
            Custom Amount:
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder={`Enter custom amount in ${currencyConfig.symbol}`}
            style={{
              width: "200px",
              padding: "0.75rem",
              border: "2px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
              textAlign: "center"
            }}
          />
        </div>

        {/* Selected amount display */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "1rem",
          color: "#6b7280",
          fontSize: "0.9rem"
        }}>
          Selected: {selectedAmount} {currencyConfig.symbol}
        </div>
      </div>

      {/* Start Quiz Button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleStartQuiz}
          disabled={isStartPending || !address}
          style={{
            backgroundColor: isStartPending || !address ? "#9ca3af" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: isStartPending || !address ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            width: "100%",
            maxWidth: "300px"
          }}
        >
          {isStartPending ? "Confirming..." : `Play Quiz (${selectedAmount} ${currencyConfig.symbol})`}
        </button>
      </div>

      {/* Loading Message */}
      {isStartPending && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "8px",
          padding: "1rem",
          marginTop: "1rem",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, color: "#92400e" }}>
            ⏳ Starting quiz... Please confirm the transaction in your wallet.
          </p>
        </div>
      )}

      {isCompleteSuccess && (
        <div style={{
          background: "#ecfdf5",
          border: "1px solid #10b981",
          borderRadius: "8px",
          padding: "1rem",
          marginTop: "1rem",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, color: "#065f46" }}>
            ✅ Previous session completed! You can now start a new quiz.
          </p>
        </div>
      )}
    </div>
  );
}

export default QuizGameContract;
