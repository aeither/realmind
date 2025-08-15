import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { toast } from 'sonner'
import { quizGameABI } from '../libs/quizGameABI'
import { getContractAddresses } from '../libs/constants'
import { hyperionTestnet } from '../wagmi'
import GlobalHeader from '../components/GlobalHeader'

interface QuizSearchParams {
  quiz?: string
}

// Quiz configurations
const QUIZ_CONFIGS = {
  'web3-basics': {
    id: 'web3-basics',
    title: 'Web3 Basics',
    description: 'Test your knowledge of blockchain fundamentals',
    questions: [
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
      }
    ]
  },
  'crypto-trading': {
    id: 'crypto-trading',
    title: 'Crypto Trading',
    description: 'Learn about trading strategies, market analysis, and risk management',
    questions: [
      {
        question: "What is a 'bull market' in cryptocurrency?",
        options: ["A market where prices are falling", "A market where prices are rising", "A market with high volatility", "A market with low trading volume"],
        correct: 1
      },
      {
        question: "What does 'FOMO' stand for in trading?",
        options: ["Fear of Missing Out", "Fear of Market Order", "Fast Order Market Option", "Financial Order Management"],
        correct: 0
      },
      {
        question: "What is 'DCA' in cryptocurrency trading?",
        options: ["Daily Crypto Analysis", "Dollar Cost Averaging", "Digital Currency Arbitrage", "Direct Crypto Access"],
        correct: 1
      }
    ]
  },
  'defi-protocols': {
    id: 'defi-protocols',
    title: 'DeFi Protocols',
    description: 'Explore decentralized finance protocols, yield farming, and liquidity pools',
    questions: [
      {
        question: "What is 'yield farming' in DeFi?",
        options: ["Growing crops on blockchain", "Earning rewards by providing liquidity", "Mining cryptocurrency", "Trading tokens"],
        correct: 1
      },
      {
        question: "What is an 'AMM' in DeFi?",
        options: ["Automated Market Maker", "Advanced Mining Method", "Asset Management Module", "Automated Money Market"],
        correct: 0
      },
      {
        question: "What is 'impermanent loss'?",
        options: ["Loss from holding tokens too long", "Loss from providing liquidity to pools", "Loss from trading fees", "Loss from network fees"],
        correct: 1
      }
    ]
  }
} as const

function QuizGame() {
  const navigate = useNavigate()
  const { quiz: quizId } = useSearch({ from: '/quiz-game' }) as QuizSearchParams
  const { address, chain } = useAccount()
  const { switchChain } = useSwitchChain()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const FIXED_ENTRY_AMOUNT = '0.0001' // Fixed entry amount in tMETIS

  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(hyperionTestnet.id)
  const quizConfig = quizId ? QUIZ_CONFIGS[quizId as keyof typeof QUIZ_CONFIGS] : null

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
  const activeQuizId = userSession && typeof userSession === 'object' && 'quizId' in userSession ? (userSession as any).quizId : '';

  // Contract writes
  const { writeContract: startQuiz, isPending: isStartPending, data: startHash } = useWriteContract()
  const { writeContract: completeQuiz, isPending: isCompletePending, data: completeHash } = useWriteContract()

  // Wait for transaction receipts
  const { isSuccess: isStartSuccess } = useWaitForTransactionReceipt({
    hash: startHash,
  })

  const { isSuccess: isCompleteSuccess } = useWaitForTransactionReceipt({
    hash: completeHash,
  })

  // Effects
  useEffect(() => {
    if (isStartSuccess) {
      toast.success('Quiz started! Good luck! 🎮')
    }
  }, [isStartSuccess])

  useEffect(() => {
    if (isCompleteSuccess) {
      toast.success('Rewards claimed! Check your wallet 🎁')
      // Navigate to home page after successful claim
      setTimeout(() => {
        navigate({ to: '/' })
      }, 2000) // Wait 2 seconds to show the success message
    }
  }, [isCompleteSuccess, navigate])

  // Handle quiz start
  const handleStartQuiz = () => {
    if (!address || !quizConfig) return
    
    const actualAmount = parseEther(FIXED_ENTRY_AMOUNT)
    const userAnswerValue = BigInt(Math.floor(Math.random() * 100) + 1)
    
    startQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'startQuiz',
      args: [quizConfig.id, userAnswerValue],
      value: actualAmount,
    })
  }

  // Handle quiz answer submission
  const handleQuizAnswer = (answer: string) => {
    if (!quizConfig) return
    
    console.log('Answer submitted:', answer)
    console.log('Current question index:', currentQuestionIndex)
    console.log('Total questions:', quizConfig.questions.length)
    
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < quizConfig.questions.length - 1) {
      console.log('Moving to next question')
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      console.log('Quiz completed - calculating score')
      // Quiz completed - calculate score
      // First calculate score for previous answers
      let finalScore = newAnswers.reduce((score, ans, index) => {
        const isCorrect = ans === quizConfig.questions[index].options[quizConfig.questions[index].correct]
        console.log(`Previous question ${index}: ${ans} vs ${quizConfig.questions[index].options[quizConfig.questions[index].correct]} = ${isCorrect}`)
        return score + (isCorrect ? 1 : 0)
      }, 0)
      
      // Then add score for current answer
      const currentAnswerCorrect = answer === quizConfig.questions[currentQuestionIndex].options[quizConfig.questions[currentQuestionIndex].correct]
      console.log(`Current question ${currentQuestionIndex}: ${answer} vs ${quizConfig.questions[currentQuestionIndex].options[quizConfig.questions[currentQuestionIndex].correct]} = ${currentAnswerCorrect}`)
      finalScore += currentAnswerCorrect ? 1 : 0
      
      console.log('Final score:', finalScore)
      setScore(finalScore)
      setQuizCompleted(true)
    }
  }

  // Handle complete quiz on blockchain
  const handleCompleteQuiz = () => {
    if (!address || !quizConfig) return
    
    // Pass the actual score (number of correct answers) to the contract
    const correctAnswerCount = BigInt(score)
    
    completeQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'completeQuiz',
      args: [correctAnswerCount],
    })
  }
  
  // Check if user is on correct chain
  const isCorrectChain = chain?.id === hyperionTestnet.id

  if (!isCorrectChain) {
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Wrong Network</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            Please switch to Hyperion (Testnet) to play this quiz.
          </p>
          <button 
            onClick={() => switchChain({ chainId: hyperionTestnet.id })}
            style={{
              backgroundColor: "#58CC02",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Switch to Hyperion Testnet
          </button>
        </div>
      </motion.div>
    )
  }

  // Redirect if no quiz ID or invalid quiz ID
  if (!quizId || !quizConfig) {
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Quiz Not Found</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            The requested quiz could not be found.
          </p>
          <button 
            onClick={() => navigate({ to: '/contract' })}
            style={{
              backgroundColor: "#58CC02",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Back to Quiz Selection
          </button>
        </div>
      </motion.div>
    )
  }

  // Check if user has an active quiz session but for a different quiz
  if (hasActiveQuiz && activeQuizId && activeQuizId !== quizId) {
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Active Quiz Session</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            You have an active quiz session for "{String(activeQuizId)}". Please complete it first.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => navigate({ to: '/quiz-game', search: { quiz: activeQuizId } })}
              style={{
                backgroundColor: "#58CC02",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Continue Active Quiz
            </button>
            <button 
              onClick={() => navigate({ to: '/contract' })}
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Back to Selection
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // If quiz is completed, show end screen
  if (quizCompleted && quizConfig) {
    const percentage = Math.round((score / quizConfig.questions.length) * 100)
    
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "3rem",
            border: "1px solid hsl(var(--border))",
            boxShadow: "var(--shadow-card)"
          }}>
            <h2 style={{ color: "#111827", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
              🎉 Quiz Completed!
            </h2>
            <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
              You scored <strong>{score} out of {quizConfig.questions.length}</strong> questions correctly ({percentage}%).
            </p>
            
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #22c55e",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem"
            }}>
              <h3 style={{ color: "#14532d", marginBottom: "1rem", fontWeight: 800 }}>🪙 Your Rewards</h3>
              <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                 Base Tokens: {FIXED_ENTRY_AMOUNT} tMETIS × 100 = {parseFloat(FIXED_ENTRY_AMOUNT) * 100} TK1
              </p>
              <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                Bonus: {score === quizConfig.questions.length ? '10-90% additional tokens for all correct answers!' : 'Better luck next time!'}
              </p>
            </div>

            <button
              onClick={handleCompleteQuiz}
              disabled={isCompletePending}
              style={{
                backgroundColor: isCompletePending ? "#9ca3af" : "#58CC02",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 700,
                cursor: isCompletePending ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                minWidth: "140px",
                opacity: isCompletePending ? 0.6 : 1
              }}
            >
              {isCompletePending ? "Claiming..." : "🎁 Claim Rewards"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If quiz is active and user has started it, show current question
  if ((isStartSuccess || (hasActiveQuiz && activeQuizId === quizId)) && quizConfig && !quizCompleted) {
    const currentQuestion = quizConfig.questions[currentQuestionIndex]
    
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem"
        }}>
          <h2 style={{ color: "#111827", marginBottom: "2rem", textAlign: "center", fontWeight: 800 }}>
            {quizConfig.title} - Question {currentQuestionIndex + 1} of {quizConfig.questions.length}
          </h2>
          <div style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "2rem",
            border: "1px solid hsl(var(--border))",
            boxShadow: "var(--shadow-card)",
            marginBottom: "2rem"
          }}>
            <h3 style={{ color: "#111827", marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 700 }}>
              {currentQuestion.question}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid hsl(var(--border))",
                    borderRadius: "8px",
                    padding: "1rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "left",
                    color: "#111827"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(var(--quiz-selected))"
                    e.currentTarget.style.borderColor = "hsl(var(--primary))"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff"
                    e.currentTarget.style.borderColor = "hsl(var(--border))"
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main quiz start interface
  return (
    <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <GlobalHeader />
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "2rem"
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "3rem",
          border: "1px solid hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
          textAlign: "center"
        }}>
          <h1 style={{ color: "#111827", marginBottom: "1rem", fontSize: "2rem", fontWeight: 800 }}>
            {quizConfig?.title || "Quiz"}
          </h1>
          <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
            {quizConfig?.description || "Test your knowledge and earn rewards!"}
          </p>
          
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
            textAlign: "left"
          }}>
            <h3 style={{ color: "#14532d", marginBottom: "1rem", fontWeight: 800 }}>📋 Quiz Info:</h3>
            <ul style={{ 
              color: "#374151", 
              lineHeight: "1.6",
              paddingLeft: "1.5rem",
              margin: 0
            }}>
              <li>📝 {quizConfig?.questions.length || 0} questions about {(quizConfig?.title || "quiz").toLowerCase()}</li>
              <li>✅ Get all answers correct for bonus rewards (10-90%)</li>
              <li>🪙 Receive Token1 tokens equal to your entry fee × 100</li>
              <li>⏰ Complete the quiz to claim your rewards</li>
            </ul>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{
              background: "#f0f9ff",
              border: "2px solid #0ea5e9",
              borderRadius: "12px",
              padding: "1rem",
              textAlign: "center"
            }}>
              <p style={{ color: "#0c4a6e", margin: "0", fontWeight: 600 }}>
                Entry Fee: {FIXED_ENTRY_AMOUNT} tMETIS
              </p>
              <p style={{ color: "#0c4a6e", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
                Earn up to {parseFloat(FIXED_ENTRY_AMOUNT) * 190} TK1 tokens!
              </p>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isStartPending || !address}
            style={{
              backgroundColor: isStartPending || !address ? "#9ca3af" : "#58CC02",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: isStartPending || !address ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              minWidth: "200px",
              opacity: isStartPending || !address ? 0.6 : 1
            }}
          >
            {isStartPending ? "Starting..." : `🎮 Start Quiz (${FIXED_ENTRY_AMOUNT} tMETIS)`}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export const Route = createFileRoute('/quiz-game')({
  component: QuizGame,
  validateSearch: (search): QuizSearchParams => ({
    quiz: search.quiz as string,
  }),
})