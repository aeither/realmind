import { useState, useEffect } from 'react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useReadContract, 
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useBalance
} from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { base } from 'wagmi/chains';
import { quizGameABI } from '../libs/quizGameABI';
import { quizGameContractAddress } from '../libs/constants';
import { hyperionTestnet } from '../wagmi';
import GamifiedEndScreen from './GamifiedEndScreen';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const ONCHAIN_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the gas fee used for in blockchain transactions?",
    options: ["Storage costs", "Network security and computation", "Token creation", "Wallet maintenance"],
    correctAnswer: 1,
    explanation: "Gas fees compensate validators for the computational resources needed to process and validate transactions.",
  },
  {
    id: 2,
    question: "What does 'DeFi' stand for?",
    options: ["Decentralized Finance", "Digital Finance", "Distributed Finance", "Direct Finance"],
    correctAnswer: 0,
    explanation: "DeFi stands for Decentralized Finance, referring to financial services built on blockchain without traditional intermediaries.",
  },
  {
    id: 3,
    question: "What is a smart contract?",
    options: ["A legal document", "Self-executing code on blockchain", "A type of cryptocurrency", "A mining algorithm"],
    correctAnswer: 1,
    explanation: "A smart contract is self-executing code that automatically enforces the terms of an agreement when conditions are met.",
  },
  {
    id: 4,
    question: "What is the purpose of Layer 2 solutions?",
    options: ["Add more tokens", "Increase scalability and reduce costs", "Create new blockchains", "Mine cryptocurrencies"],
    correctAnswer: 1,
    explanation: "Layer 2 solutions are built on top of main blockchains to increase transaction speed and reduce costs while maintaining security.",
  },
  {
    id: 5,
    question: "What does 'TVL' measure in DeFi?",
    options: ["Transaction Volume Limit", "Total Value Locked", "Token Validation Level", "Trading Velocity Line"],
    correctAnswer: 1,
    explanation: "TVL (Total Value Locked) measures the total amount of assets deposited in DeFi protocols.",
  }
];

function QuizGameContract() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'submitting' | 'completed' | 'endScreen'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [originalAnswer, setOriginalAnswer] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(1);

  // Get user balance
  const { data: balance } = useBalance({
    address,
    chainId: hyperionTestnet.id,
  });

  // Read contract data
  const { data: playAmount } = useReadContract({
    abi: quizGameABI,
    address: quizGameContractAddress as `0x${string}`,
    functionName: 'playAmount',
    chainId: hyperionTestnet.id,
  });

  const { data: userSession, refetch: refetchSession } = useReadContract({
    abi: quizGameABI,
    address: quizGameContractAddress as `0x${string}`,
    functionName: 'getQuizSession',
    args: address ? [address] : undefined,
    chainId: hyperionTestnet.id,
  });

  // Write contract hooks
  const { 
    data: startQuizHash, 
    isPending: isStartPending,
    writeContract: startQuiz,
    error: startError,
    reset: resetStart
  } = useWriteContract();

  const { 
    data: completeQuizHash, 
    isPending: isCompletePending,
    writeContract: completeQuiz,
    error: completeError,
    reset: resetComplete
  } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isStartConfirming, isSuccess: isStartConfirmed } = 
    useWaitForTransactionReceipt({ hash: startQuizHash });

  const { isLoading: isCompleteConfirming, isSuccess: isCompleteConfirmed } = 
    useWaitForTransactionReceipt({ hash: completeQuizHash });

  // Reset game state when starting new quiz
  useEffect(() => {
    if (isStartConfirmed) {
      setGameState('playing');
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setScore(0);
      refetchSession();
    }
  }, [isStartConfirmed, refetchSession]);

  // Handle quiz completion
  useEffect(() => {
    if (isCompleteConfirmed) {
      setGameState('completed');
      refetchSession();
    }
  }, [isCompleteConfirmed, refetchSession]);

  const currentQuestion = ONCHAIN_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ONCHAIN_QUESTIONS.length - 1;
  const isCorrectChain = chain?.id === hyperionTestnet.id;

  const handleStartQuiz = async () => {
    if (!isConnected) return;
    
    // Calculate the final answer (sum of all answers)
    const finalAnswer = Math.floor(Math.random() * 100) + 1; // Random number for demo
    setOriginalAnswer(finalAnswer);
    
    const amountToPay = parseEther(selectedAmount.toString());
    
    resetStart();
    startQuiz({
      abi: quizGameABI,
      address: quizGameContractAddress as `0x${string}`,
      functionName: 'startQuiz',
      args: [BigInt(finalAnswer)],
      value: amountToPay,
      chainId: hyperionTestnet.id,
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);
    
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setGameState('endScreen');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleCompleteQuiz = () => {
    if (!originalAnswer) return;
    
    resetComplete();
    setGameState('submitting');
    
    completeQuiz({
      abi: quizGameABI,
      address: quizGameContractAddress as `0x${string}`,
      functionName: 'completeQuiz',
      args: [BigInt(originalAnswer)],
      chainId: hyperionTestnet.id,
    });
  };

  const handleRestart = () => {
    setGameState('idle');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setScore(0);
    setOriginalAnswer(null);
    resetStart();
    resetComplete();
  };

  if (!isConnected) {
    return (
      <div style={{ 
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#667eea" }}>
          🎮 Onchain Quiz Game
        </h1>
        
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          padding: "3rem",
          color: "white",
          marginBottom: "3rem"
        }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Play & Earn Real Crypto!</h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.9 }}>
            Answer blockchain questions correctly and earn cryptocurrency rewards. 
            Each game costs a small entry fee and pays out based on your performance.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "12px",
                  padding: "1rem 2rem",
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
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "left"
        }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1f2937" }}>How It Works:</h3>
          <ul style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#374151" }}>
            <li>📝 Answer 5 blockchain knowledge questions</li>
            <li>💰 Pay a small entry fee to start playing</li>
            <li>🎲 Win 10% to 120% of your entry fee based on luck and skill</li>
            <li>🪙 Get minted tokens as participation rewards</li>
            <li>⚡ All transactions happen on Hyperion Testnet</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div style={{ 
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#ef4444" }}>
          ⚠️ Wrong Network
        </h2>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#6b7280" }}>
          Please switch to Hyperion Testnet to play the quiz game.
        </p>
        <button
          onClick={() => switchChain({ chainId: hyperionTestnet.id })}
          style={{
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)"
          }}
        >
          Switch to Hyperion Testnet
        </button>
        <button
          onClick={() => disconnect()}
          style={{
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "1rem 2rem",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            marginLeft: "1rem"
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (gameState === 'endScreen') {
    return (
      <GamifiedEndScreen
        score={score}
        totalQuestions={ONCHAIN_QUESTIONS.length}
        onClaim={handleCompleteQuiz}
        onPlayAgain={handleRestart}
        onExit={() => disconnect()}
        isClaiming={isCompletePending || isCompleteConfirming}
        transactionHash={completeQuizHash}
      />
    );
  }

  if (gameState === 'completed') {
    return (
      <GamifiedEndScreen
        score={score}
        totalQuestions={ONCHAIN_QUESTIONS.length}
        onClaim={() => {}} // Already claimed
        onPlayAgain={handleRestart}
        onExit={() => disconnect()}
        isClaiming={false}
        transactionHash={completeQuizHash}
      />
    );
  }

  if (gameState === 'playing') {
    const progressPercent = ((currentQuestionIndex + 1) / ONCHAIN_QUESTIONS.length) * 100;

    return (
      <div style={{ 
        padding: "2rem",
        maxWidth: "700px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#667eea" }}>
            🎮 Onchain Quiz Game
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
            Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: "100%",
          height: "12px",
          backgroundColor: "#e5e7eb",
          borderRadius: "6px",
          marginBottom: "2rem",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: "100%",
            backgroundColor: "#667eea",
            borderRadius: "6px",
            transition: "width 0.3s ease"
          }} />
        </div>

        {/* Question Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <h3 style={{
            fontSize: "1.5rem",
            marginBottom: "2rem",
            color: "#1f2937",
            lineHeight: "1.6"
          }}>
            {currentQuestion.question}
          </h3>

          <div style={{ marginBottom: "2rem" }}>
            {currentQuestion.options.map((option, index) => {
              let backgroundColor = "#f9fafb";
              let borderColor = "#d1d5db";
              let color = "#374151";
              
              if (selectedAnswer !== null) {
                if (index === currentQuestion.correctAnswer) {
                  backgroundColor = "#d1fae5";
                  borderColor = "#10b981";
                  color = "#065f46";
                } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                  backgroundColor = "#fee2e2";
                  borderColor = "#ef4444";
                  color = "#991b1b";
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "1rem",
                    marginBottom: "1rem",
                    backgroundColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: "12px",
                    fontSize: "1rem",
                    cursor: selectedAnswer !== null ? "default" : "pointer",
                    textAlign: "left",
                    color,
                    fontWeight: "500",
                    transition: "all 0.2s ease"
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div style={{
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#6b7280",
            marginBottom: "1rem"
          }}>
            Question {currentQuestionIndex + 1} of {ONCHAIN_QUESTIONS.length}
          </div>

          {selectedAnswer !== null && (
            <div style={{ 
              margin: '1.5rem 0', 
              color: '#0c4a6e', 
              background: '#f0f9ff', 
              border: '2px solid #0ea5e9', 
              borderRadius: '12px', 
              padding: '1.5rem' 
            }}>
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </div>
          )}

          {selectedAnswer !== null && (
            <button
              onClick={handleNextQuestion}
              disabled={gameState === 'submitting' || isCompletePending || isCompleteConfirming}
              style={{
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "1rem 2rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)"
              }}
            >
              {isLastQuestion ? (
                gameState === 'submitting' || isCompletePending 
                  ? 'Submitting...' 
                  : isCompleteConfirming 
                    ? 'Confirming...' 
                    : 'Submit Quiz'
              ) : 'Next Question →'}
            </button>
          )}
        </div>

        {/* Transaction Status */}
        {(isCompletePending || isCompleteConfirming) && (
          <div style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "1rem",
            textAlign: "center",
            marginBottom: "1rem"
          }}>
            <p style={{ margin: 0, color: "#92400e" }}>
              {isCompletePending ? '⏳ Waiting for wallet confirmation...' : '🔄 Transaction confirming on blockchain...'}
            </p>
          </div>
        )}

        {completeError && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            padding: "1rem",
            textAlign: "center",
            marginBottom: "1rem"
          }}>
            <p style={{ margin: 0, color: "#991b1b" }}>
              ❌ Error: {completeError.message}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Game state: 'idle' - Show game info and start button
  return (
    <div style={{ 
      padding: "2rem",
      maxWidth: "700px",
      margin: "0 auto",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#667eea" }}>
        🎮 Onchain Quiz Game
      </h1>

      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        marginBottom: "2rem"
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Connected Wallet</h3>
          <p style={{ 
            fontFamily: "monospace", 
            fontSize: "1rem", 
            color: "#6b7280",
            backgroundColor: "#f3f4f6",
            padding: "0.5rem",
            borderRadius: "6px"
          }}>
            {address}
          </p>
          <p style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: "0.5rem" }}>
            Network: {chain?.name}
          </p>
        </div>

        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
          <h4 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#1f2937" }}>Game Rules:</h4>
          <ul style={{ fontSize: "1rem", lineHeight: "1.8", color: "#374151" }}>
            <li>📝 Answer 5 blockchain knowledge questions</li>
            <li>🎲 Win 10% to 120% of your entry fee (randomly determined)</li>
            <li>🪙 Receive Token1 tokens equal to your entry fee</li>
            <li>⏰ Complete within 1 hour of starting</li>
          </ul>
        </div>

        {/* Amount Selection */}
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#1f2937", textAlign: "center" }}>
            💰 Select Entry Amount
          </h4>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "1rem"
          }}>
            {[0.01, 0.1, 1, 5, 10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                style={{
                  padding: "1rem",
                  borderRadius: "12px",
                  border: selectedAmount === amount ? "3px solid #667eea" : "2px solid #e5e7eb",
                  backgroundColor: selectedAmount === amount ? "#f0f8ff" : "white",
                  color: selectedAmount === amount ? "#667eea" : "#374151",
                  fontWeight: selectedAmount === amount ? "bold" : "normal",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: "1rem"
                }}
                onMouseEnter={(e) => {
                  if (selectedAmount !== amount) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAmount !== amount) {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                {amount} tMETIS
              </button>
            ))}
          </div>
          <p style={{
            fontSize: "0.9rem",
            color: "#6b7280",
            textAlign: "center"
          }}>
            Selected: {selectedAmount} tMETIS
          </p>
          
          {/* Balance Warning */}
          {balance && parseFloat(formatEther(balance.value)) < selectedAmount && (
            <div style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              padding: "1rem",
              marginTop: "1rem",
              textAlign: "center"
            }}>
              <p style={{ margin: 0, color: "#92400e", fontSize: "0.9rem" }}>
                ⚠️ Insufficient balance. You need {selectedAmount} tMETIS but have {parseFloat(formatEther(balance.value)).toFixed(4)} tMETIS
              </p>
            </div>
          )}
        </div>

        {userSession && userSession[0] && (
          <div style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "2rem",
            textAlign: "left"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#92400e" }}>⚠️ Active Session Found</h4>
            <p style={{ margin: 0, color: "#92400e", fontSize: "0.9rem" }}>
              You have an active quiz session. Complete it before starting a new one.
            </p>
          </div>
        )}

        <button
          onClick={handleStartQuiz}
          disabled={
            !balance || 
            parseFloat(formatEther(balance.value)) < selectedAmount ||
            isStartPending || 
            isStartConfirming || 
            (userSession && userSession[0]) // Disable if active session
          }
          style={{
            backgroundColor: (userSession && userSession[0]) || (balance && parseFloat(formatEther(balance.value)) < selectedAmount) ? "#9ca3af" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            fontWeight: "600",
            cursor: (userSession && userSession[0]) || (balance && parseFloat(formatEther(balance.value)) < selectedAmount) ? "not-allowed" : "pointer",
            boxShadow: (userSession && userSession[0]) || (balance && parseFloat(formatEther(balance.value)) < selectedAmount) ? "none" : "0 4px 6px rgba(102, 126, 234, 0.3)",
            transition: "all 0.3s ease",
            marginBottom: "1rem",
            opacity: (userSession && userSession[0]) || (balance && parseFloat(formatEther(balance.value)) < selectedAmount) ? 0.6 : 1
          }}
        >
          {isStartPending 
            ? 'Confirming...' 
            : isStartConfirming 
              ? 'Starting Game...' 
              : `Play Quiz (${selectedAmount} tMETIS)`
          }
        </button>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => disconnect()}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Transaction Status */}
      {(isStartPending || isStartConfirming) && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "8px",
          padding: "1rem",
          textAlign: "center",
          marginBottom: "1rem"
        }}>
          <p style={{ margin: 0, color: "#92400e" }}>
            {isStartPending ? '⏳ Waiting for wallet confirmation...' : '🔄 Transaction confirming on blockchain...'}
          </p>
        </div>
      )}

      {startQuizHash && (
        <div style={{
          background: "#e6f7ff",
          border: "1px solid #0ea5e9",
          borderRadius: "8px",
          padding: "1rem",
          textAlign: "center",
          marginBottom: "1rem"
        }}>
          <p style={{ margin: "0 0 0.5rem 0", color: "#0c4a6e", fontWeight: "600" }}>
            🔗 Transaction Hash:
          </p>
          <p style={{ 
            margin: "0 0 0.5rem 0", 
            fontSize: "0.8rem", 
            wordBreak: "break-all", 
            fontFamily: "monospace",
            color: "#0c4a6e"
          }}>
            {startQuizHash}
          </p>
          <a 
            href={`${hyperionTestnet.blockExplorers.default.url}/tx/${startQuizHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: "#0ea5e9", textDecoration: "none", fontSize: "0.9rem" }}
          >
            View on Block Explorer →
          </a>
        </div>
      )}

      {startError && (
        <div style={{
          background: "#fee2e2",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          padding: "1rem",
          textAlign: "center",
          marginBottom: "1rem"
        }}>
          <p style={{ margin: 0, color: "#991b1b" }}>
            ❌ Error: {startError.message}
          </p>
        </div>
      )}
    </div>
  );
}

export default QuizGameContract;