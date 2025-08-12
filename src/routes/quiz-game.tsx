import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { toast } from 'sonner'
import { quizGameABI } from '../libs/quizGameABI'
import { getContractAddresses } from '../libs/constants'
import { coreTestnet } from '../wagmi'
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
  const [selectedAmount, setSelectedAmount] = useState('0.1')

  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(coreTestnet.id)
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
  const activeQuizId = userSession?.quizId || '';

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
      setTimeout(() => {
        navigate({ to: '/contract' })
      }, 2000)
    }
  }, [isCompleteSuccess, navigate])

  // Handle quiz start
  const handleStartQuiz = () => {
    if (!address || !quizConfig) return
    
    const actualAmount = parseEther(selectedAmount)
    const userAnswerValue = BigInt(Math.floor(Math.random() * 100) + 1)
    
    if (!quizConfig) return
    
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
    
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < quizConfig.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Quiz completed - calculate score
      const correctAnswer = quizConfig.questions[currentQuestionIndex].options[quizConfig.questions[currentQuestionIndex].correct]
      const isCorrect = answer === correctAnswer
      
      const finalScore = newAnswers.reduce((score, ans, index) => {
        return score + (ans === quizConfig.questions[index].options[quizConfig.questions[index].correct] ? 1 : 0)
      }, 0) + (isCorrect ? 1 : 0)
      
      setScore(finalScore)
      setQuizCompleted(true)
    }
  }

  // Handle complete quiz on blockchain
  const handleCompleteQuiz = () => {
    if (!address || !quizConfig) return
    
    const answerToSubmit = BigInt(Math.floor(Math.random() * 100) + 1)
    
    completeQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'completeQuiz',
      args: [answerToSubmit],
    })
  }
  
  // Check if user is on correct chain
  const isCorrectChain = chain?.id === coreTestnet.id

  if (!isCorrectChain) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#ffffff", marginBottom: "1rem" }}>Wrong Network</h2>
          <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>
            Please switch to Core Testnet to play this quiz.
          </p>
          <button 
            onClick={() => switchChain({ chainId: coreTestnet.id })}
            style={{
              backgroundColor: "#00ff87",
              color: "#0a0e0a",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Switch to Core Testnet
          </button>
        </div>
      </div>
    )
  }

  // Redirect if no quiz ID or invalid quiz ID
  if (!quizId || !quizConfig) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#ffffff", marginBottom: "1rem" }}>Quiz Not Found</h2>
          <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>
            The requested quiz could not be found.
          </p>
          <button 
            onClick={() => navigate({ to: '/contract' })}
            style={{
              backgroundColor: "#00ff87",
              color: "#0a0e0a",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Back to Quiz Selection
          </button>
        </div>
      </div>
    )
  }

  // Check if user has an active quiz session but for a different quiz
  if (hasActiveQuiz && activeQuizId && activeQuizId !== quizId) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#ffffff", marginBottom: "1rem" }}>Active Quiz Session</h2>
          <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>
            You have an active quiz session for "{activeQuizId}". Please complete it first.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => navigate({ to: '/quiz-game', search: { quiz: activeQuizId } })}
              style={{
                backgroundColor: "#00ff87",
                color: "#0a0e0a",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Continue Active Quiz
            </button>
            <button 
              onClick={() => navigate({ to: '/contract' })}
              style={{
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
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
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: "16px",
            padding: "3rem",
            border: "1px solid rgba(0, 255, 135, 0.2)"
          }}>
            <h2 style={{ color: "#00ff87", marginBottom: "1rem", fontSize: "2rem" }}>
              🎉 Quiz Completed!
            </h2>
            <p style={{ color: "#ffffff", marginBottom: "2rem", fontSize: "1.1rem" }}>
              You scored <strong>{score} out of {quizConfig.questions.length}</strong> questions correctly ({percentage}%).
            </p>
            
            <div style={{
              background: "rgba(0, 255, 135, 0.1)",
              border: "1px solid rgba(0, 255, 135, 0.3)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem"
            }}>
              <h3 style={{ color: "#00ff87", marginBottom: "1rem" }}>🪙 Your Rewards</h3>
              <p style={{ color: "#ffffff", margin: "0.5rem 0" }}>
                Base Tokens: {selectedAmount} CORE × 100 = {parseFloat(selectedAmount) * 100} TK1
              </p>
              <p style={{ color: "#ffffff", margin: "0.5rem 0" }}>
                Bonus: {score === quizConfig.questions.length ? '10-90% additional tokens for all correct answers!' : 'Better luck next time!'}
              </p>
            </div>

            <button
              onClick={handleCompleteQuiz}
              disabled={isCompletePending}
              style={{
                backgroundColor: isCompletePending ? "#374151" : "#00ff87",
                color: isCompletePending ? "#9ca3af" : "#0a0e0a",
                border: "none",
                borderRadius: "12px",
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: isCompletePending ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                minWidth: "140px"
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
  if ((isStartSuccess || (hasActiveQuiz && activeQuizId === quizId)) && !quizCompleted && quizConfig) {
    const currentQuestion = quizConfig.questions[currentQuestionIndex]
    
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem"
        }}>
          <h2 style={{ color: "#ffffff", marginBottom: "2rem", textAlign: "center" }}>
            {quizConfig.title} - Question {currentQuestionIndex + 1} of {quizConfig.questions.length}
          </h2>
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: "12px",
            padding: "2rem",
            border: "1px solid rgba(0, 255, 135, 0.2)",
            marginBottom: "2rem"
          }}>
            <h3 style={{ color: "#ffffff", marginBottom: "1.5rem", fontSize: "1.3rem" }}>
              {currentQuestion.question}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(55, 65, 81, 0.5)",
                    borderRadius: "8px",
                    padding: "1rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "left",
                    color: "#ffffff"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 255, 135, 0.1)"
                    e.currentTarget.style.borderColor = "#00ff87"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.8)"
                    e.currentTarget.style.borderColor = "rgba(55, 65, 81, 0.5)"
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
    <div style={{ paddingTop: '80px' }}>
      <GlobalHeader />
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "2rem"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "16px",
          padding: "3rem",
          border: "1px solid rgba(0, 255, 135, 0.2)",
          textAlign: "center"
        }}>
          <h1 style={{ color: "#00ff87", marginBottom: "1rem", fontSize: "2.5rem" }}>
            {quizConfig?.title || "Quiz"}
          </h1>
          <p style={{ color: "#ffffff", marginBottom: "2rem", fontSize: "1.1rem" }}>
            {quizConfig?.description || "Test your knowledge and earn rewards!"}
          </p>
          
          <div style={{
            background: "rgba(0, 255, 135, 0.1)",
            border: "1px solid rgba(0, 255, 135, 0.3)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
            textAlign: "left"
          }}>
            <h3 style={{ color: "#00ff87", marginBottom: "1rem" }}>📋 Quiz Info:</h3>
            <ul style={{ 
              color: "#ffffff", 
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
            <label style={{ 
              display: "block", 
              color: "#ffffff", 
              marginBottom: "0.5rem",
              fontWeight: "500"
            }}>
              Entry Amount (CORE):
            </label>
            <input
              type="number"
              step="0.1"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value)}
              style={{
                width: "200px",
                padding: "0.75rem",
                border: "1px solid rgba(55, 65, 81, 0.5)",
                borderRadius: "8px",
                fontSize: "1rem",
                textAlign: "center",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                color: "#ffffff"
              }}
            />
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isStartPending || !address}
            style={{
              backgroundColor: isStartPending || !address ? "#374151" : "#00ff87",
              color: isStartPending || !address ? "#9ca3af" : "#0a0e0a",
              border: "none",
              borderRadius: "12px",
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: isStartPending || !address ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              minWidth: "200px"
            }}
          >
            {isStartPending ? "Starting..." : `🎮 Start Quiz (${selectedAmount} CORE)`}
          </button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/quiz-game')({
  component: QuizGame,
  validateSearch: (search): QuizSearchParams => ({
    quiz: search.quiz as string,
  }),
})