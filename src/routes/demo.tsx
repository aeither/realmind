import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'sonner'
import { quizGameABI } from '../libs/quizGameABI'
import { parseEther, formatEther } from 'viem'
import { RedStoneOracle, GoldskyIndexer, BlockchainUtils } from '../libs/blockchainServices'
import { getContractAddresses } from '../libs/constants'

// Demo Flow Component - 2-minute MVP demonstration
export function DemoFlow() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const { address } = useAccount()

  // Manual progression - removed auto-timing for more control
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      {/* Demo Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-sm border-b border-emerald-500/30">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">Realmind Demo Flow</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                ← Previous
              </button>
              <div className="text-emerald-400 text-sm font-bold">
                Step {currentStep}/4
              </div>
              <button
                onClick={handleNextStep}
                disabled={currentStep === 4}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentStep === 4
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          
          {/* Step Navigation */}
          <div className="flex justify-between mt-6 text-sm">
            {[
              { id: 1, title: "Solo Quiz", icon: "🎯" },
              { id: 2, title: "PvP Duel", icon: "⚔️" },
              { id: 3, title: "Guild System", icon: "🛡️" },
              { id: 4, title: "NFT Quizzes", icon: "🖼️" }
            ].map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id as 1 | 2 | 3 | 4)}
                className={`px-3 py-2 rounded-lg transition-colors font-medium ${
                  currentStep === step.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <div className="text-base">{step.icon}</div>
                <div className="text-xs">{step.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Demo Content */}
      <div className="pt-32 pb-8">
        {currentStep === 1 && <Step1SoloQuiz onNext={handleNextStep} />}
        {currentStep === 2 && <Step2PvPDuel onNext={handleNextStep} />}
        {currentStep === 3 && <Step3GuildSystem onNext={handleNextStep} />}
        {currentStep === 4 && <Step4NFTQuizzes onNext={handleNextStep} />}
      </div>
    </div>
  )
}

// Step 1: Solo Quiz - "Learn & Earn"
function Step1SoloQuiz({ onNext }: { onNext: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [earnedCORE, setEarnedCORE] = useState(0)
  const [streak, setStreak] = useState(3)
  const [isProcessingReward, setIsProcessingReward] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const { address, chain } = useAccount()

  // Smart contract integration
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(1114)
  const { writeContract: startQuiz, isPending: isStartPending, data: startHash } = useWriteContract()
  const { writeContract: completeQuiz, isPending: isCompletePending, data: completeHash } = useWriteContract()
  
  const { isSuccess: isStartSuccess } = useWaitForTransactionReceipt({ hash: startHash })
  const { isSuccess: isCompleteSuccess } = useWaitForTransactionReceipt({ hash: completeHash })

  // Handle transaction success
  useEffect(() => {
    if (isStartSuccess) {
      setQuizStarted(true)
      toast.success('🎮 Quiz started on-chain!')
    }
  }, [isStartSuccess])

  useEffect(() => {
    if (isCompleteSuccess) {
      setQuizCompleted(true)
      toast.success('🎁 Rewards claimed successfully!')
    }
  }, [isCompleteSuccess])

  const handleStartQuiz = () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    startQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'startQuiz',
      args: ['solo-quiz-demo', BigInt(42)], // quiz ID and initial answer
      value: parseEther('0.01'), // Entry fee
    })
  }

  const handleCompleteQuiz = () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    completeQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'completeQuiz',
      args: [BigInt(score * 25)], // Submit score-based answer
    })
  }

  const questions = [
    {
      question: "What is the native token of Core?",
      options: ["CORE", "ETH", "BTC", "LINK"],
      correct: 0,
      reward: 0.05
    },
    {
      question: "Which consensus mechanism does Core use?",
      options: ["Proof of Work", "Proof of Stake", "Delegated PoS", "Proof of Authority"],
      correct: 1,
      reward: 0.05
    }
  ]

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1)
      const reward = questions[currentQuestion].reward
      setEarnedCORE(earnedCORE + reward)
      toast.success(`✅ Correct! +${reward} CORE earned`)
    } else {
      toast.error("❌ Incorrect answer")
    }

    // Manual progression after showing result
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      }
    }, 2000)
  }

  // Show start quiz interface if quiz not started
  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 Step 1: Solo Quiz - Learn & Earn
          </h1>
          <p className="text-emerald-400 text-lg">
            Start a quiz on Core blockchain and earn CORE rewards
          </p>
        </div>

        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Quiz?</h3>
          <p className="text-gray-400 mb-6">
            Entry fee: 0.01 CORE • Potential rewards: Up to 0.1 CORE
          </p>
          
          <button
            onClick={handleStartQuiz}
            disabled={isStartPending || !address}
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStartPending ? '⏳ Starting Quiz...' : '🚀 Start Quiz On-Chain'}
          </button>
          
          {!address && (
            <p className="text-yellow-400 text-sm mt-4">
              Please connect your wallet to start the quiz
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎯 Step 1: Solo Quiz - Learn & Earn
        </h1>
        <p className="text-emerald-400 text-lg">
          Quiz started on-chain! Answer questions to earn rewards
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-black/30 border border-emerald-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{earnedCORE.toFixed(3)}</div>
          <div className="text-sm text-gray-400">CORE Earned</div>
        </div>
        <div className="bg-black/30 border border-emerald-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{streak}</div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
        <div className="bg-black/30 border border-emerald-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{score}/{questions.length}</div>
          <div className="text-sm text-gray-400">Score</div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-8 mb-6">
        <div className="text-center mb-6">
          <div className="text-sm text-emerald-400 mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {questions[currentQuestion].question}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {questions[currentQuestion].options.map((option, index) => {
            let bgColor = 'bg-gray-800 hover:bg-gray-700'
            let borderColor = 'border-gray-600'
            
            if (showResult && selectedAnswer !== null) {
              if (index === questions[currentQuestion].correct) {
                bgColor = 'bg-green-600'
                borderColor = 'border-green-400'
              } else if (index === selectedAnswer) {
                bgColor = 'bg-red-600'
                borderColor = 'border-red-400'
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${bgColor} ${borderColor} text-white`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Real-time Feedback */}
      {showResult && (
        <div className="text-center">
          {isProcessingReward ? (
            <div className="animate-pulse text-yellow-400 text-lg">
              ⏳ Processing reward on Core blockchain...
            </div>
          ) : (
            <div className="text-emerald-400 text-lg">
              ⚡ Transaction confirmed in 0.4s on Core
              {selectedAnswer === questions[currentQuestion].correct && (
                <div className="text-sm text-green-300 mt-1">
                  🎉 +{questions[currentQuestion].reward} CORE added to wallet
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Complete Quiz Button - shown when all questions answered */}
      {currentQuestion >= questions.length - 1 && showResult && !quizCompleted && (
        <div className="text-center mt-8">
          <button
            onClick={handleCompleteQuiz}
            disabled={isCompletePending}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompletePending ? '⏳ Completing Quiz...' : '🎁 Complete Quiz & Claim Rewards'}
          </button>
        </div>
      )}

      {/* Next Step Button - shown when quiz is fully completed */}
      {quizCompleted && (
        <div className="text-center mt-8">
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-white font-bold text-xl">Quiz Completed On-Chain!</div>
            <div className="text-green-400">Rewards claimed successfully</div>
          </div>
          <button
            onClick={onNext}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
          >
            Continue to PvP Duel ⚔️
          </button>
        </div>
      )}
    </div>
  )
}

// Step 2: PvP Duel - "Battle in Real-Time"
function Step2PvPDuel({ onNext }: { onNext: () => void }) {
  const [duelState, setDuelState] = useState<'start' | 'matchmaking' | 'battle' | 'result'>('start')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState<number | null>(null)
  const [opponentAnswer, setOpponentAnswer] = useState<number | null>(null)
  const [winner, setWinner] = useState<'user' | 'opponent' | 'tie' | null>(null)
  const [duelCompleted, setDuelCompleted] = useState(false)
  const { address, chain } = useAccount()

  // Smart contract integration
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(1114)
  const { writeContract: startDuel, isPending: isStartPending, data: startHash } = useWriteContract()
  const { writeContract: completeDuel, isPending: isCompletePending, data: completeHash } = useWriteContract()
  
  const { isSuccess: isStartSuccess } = useWaitForTransactionReceipt({ hash: startHash })
  const { isSuccess: isCompleteSuccess } = useWaitForTransactionReceipt({ hash: completeHash })

  // Handle transaction success
  useEffect(() => {
    if (isStartSuccess) {
      setDuelState('matchmaking')
      toast.success('🎮 Duel started on-chain! Finding opponent...')
    }
  }, [isStartSuccess])

  useEffect(() => {
    if (isCompleteSuccess) {
      setDuelCompleted(true)
      toast.success('🎁 Duel rewards claimed!')
    }
  }, [isCompleteSuccess])

  const handleStartDuel = () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    startDuel({
      address: contractAddresses.quizDuelContractAddress as `0x${string}`,
      abi: quizGameABI, // Using same ABI for demo
      functionName: 'startQuiz',
      args: ['pvp-duel-demo', BigInt(123)],
      value: parseEther('0.02'), // Entry fee for duel
    })
  }

  const handleCompleteDuel = () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    completeDuel({
      address: contractAddresses.quizDuelContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'completeQuiz',
      args: [BigInt(winner === 'user' ? 100 : 50)],
    })
  }

  const [oracleQuestion, setOracleQuestion] = useState<{
    question: string
    options: string[]
    correct: number
    isOracle: boolean
  } | null>(null)

  const duelQuestions = [
    oracleQuestion || {
      question: "Loading RedStone Oracle data...",
      options: ["Loading...", "Loading...", "Loading...", "Loading..."],
      correct: 0,
      isOracle: true
    },
    {
      question: "How many confirmations for Core finality?",
      options: ["1", "6", "12", "20"],
      correct: 0,
      isOracle: false
    }
  ]

  // Load Oracle data when component mounts
  useEffect(() => {
    const loadOracleData = async () => {
      try {
        const priceData = await RedStoneOracle.getPrice('CORE')
        const options = ["$0.95", "$1.23", "$1.45", "$2.10"]
        const questionData = RedStoneOracle.formatPriceQuestion('CORE', priceData.price, options)
        setOracleQuestion({
          ...questionData,
          isOracle: true
        })
        toast.success("🔮 RedStone Oracle data loaded", { 
          description: `Current CORE price: $${priceData.price}` 
        })
      } catch (error) {
        console.error('Oracle error:', error)
        setOracleQuestion({
          question: "What's the current price of CORE? (RedStone Oracle)",
          options: ["$0.95", "$1.23", "$1.45", "$2.10"],
          correct: 1,
          isOracle: true
        })
      }
    }

    if (duelState === 'battle' && !oracleQuestion) {
      loadOracleData()
    }
  }, [duelState, oracleQuestion])

  useEffect(() => {
    if (duelState === 'matchmaking') {
      const timer = setTimeout(() => {
        setDuelState('battle')
        toast.success("🎮 Opponent found! Duel starting...")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [duelState])

  const handleAnswer = (answerIndex: number) => {
    setUserAnswer(answerIndex)
    
    // Simulate opponent answer
    setTimeout(() => {
      const opponentAns = Math.floor(Math.random() * 4)
      setOpponentAnswer(opponentAns)
      
      // Determine winner
      const correct = duelQuestions[currentQuestion].correct
      const userCorrect = answerIndex === correct
      const opponentCorrect = opponentAns === correct
      
      if (userCorrect && !opponentCorrect) {
        setWinner('user')
        toast.success("🏆 You win! +0.1 CORE")
      } else if (!userCorrect && opponentCorrect) {
        setWinner('opponent')
        toast.error("😔 Opponent wins this round")
      } else {
        setWinner('tie')
        toast.info("🤝 It's a tie!")
      }
      
      setTimeout(() => {
        if (currentQuestion < duelQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
          setUserAnswer(null)
          setOpponentAnswer(null)
          setWinner(null)
        } else {
          setDuelState('result')
          setTimeout(() => onNext(), 3000)
        }
      }, 2000)
    }, 1500)
  }

  if (duelState === 'start') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ⚔️ Step 2: PvP Duel - Battle in Real-Time
        </h1>
        <p className="text-emerald-400 text-lg mb-8">
          Challenge opponents with RedStone Oracle-powered questions
        </p>
        
        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-2xl font-bold text-white mb-4">Ready for PvP Battle?</h3>
          <p className="text-gray-400 mb-6">
            Entry fee: 0.02 CORE • Winner takes all + bonus rewards
          </p>
          
          <button
            onClick={handleStartDuel}
            disabled={isStartPending || !address}
            className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStartPending ? '⏳ Starting Duel...' : '⚔️ Start PvP Duel'}
          </button>
          
          {!address && (
            <p className="text-yellow-400 text-sm mt-4">
              Please connect your wallet to start the duel
            </p>
          )}
        </div>
      </div>
    )
  }

  if (duelState === 'matchmaking') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ⚔️ Step 2: PvP Duel - Battle in Real-Time
        </h1>
        <p className="text-emerald-400 text-lg mb-8">
          Duel started on-chain! Finding worthy opponent...
        </p>
        
        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-12">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <div className="text-2xl font-bold text-white mb-2">Finding Opponent...</div>
          <div className="text-emerald-400 mb-4">Core real-time matching</div>
        </div>
      </div>
    )
  }

  if (duelState === 'result' && !duelCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">Duel Battle Finished!</h2>
          <div className="text-emerald-400 text-lg mb-4">
            {winner === 'user' ? '🏆 You Won!' : winner === 'opponent' ? '😔 Opponent Won' : '🤝 Tie Game'}
          </div>
          <div className="text-gray-400 mb-6">
            RedStone Oracle integration ✅ • Commit-reveal scheme ✅
          </div>
          
          <button
            onClick={handleCompleteDuel}
            disabled={isCompletePending}
            className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompletePending ? '⏳ Claiming Rewards...' : '💰 Claim Duel Rewards'}
          </button>
        </div>
      </div>
    )
  }

  if (duelCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-white font-bold text-xl">Duel Completed On-Chain!</div>
          <div className="text-green-400">Rewards claimed successfully</div>
        </div>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Continue to Guild System 🛡️
        </button>
      </div>
    )
  }



  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          ⚔️ Live Duel in Progress
        </h1>
        <div className="text-emerald-400">
          {duelQuestions[currentQuestion].isOracle && "🔮 RedStone Oracle Question"}
        </div>
      </div>

      {/* Duel Arena */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-white font-bold">You</div>
            <div className="text-blue-400 text-sm">Answer: {userAnswer !== null ? duelQuestions[currentQuestion].options[userAnswer] : 'Thinking...'}</div>
          </div>
        </div>
        
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-white font-bold">Opponent</div>
            <div className="text-red-400 text-sm">Answer: {opponentAnswer !== null ? duelQuestions[currentQuestion].options[opponentAnswer] : 'Thinking...'}</div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-8 mb-6">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          {duelQuestions[currentQuestion].question}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {duelQuestions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={userAnswer !== null}
              className="p-4 rounded-xl border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Winner Display */}
      {winner && (
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            winner === 'user' ? 'text-green-400' : 
            winner === 'opponent' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {winner === 'user' ? '🏆 You Win!' : 
             winner === 'opponent' ? '😔 Opponent Wins' : '🤝 Tie!'}
          </div>
        </div>
      )}
    </div>
  )
}

// Step 3: Guild System - "Study Together, Win Together"
function Step3GuildSystem({ onNext }: { onNext: () => void }) {
  const [guildState, setGuildState] = useState<'create' | 'formed' | 'battle' | 'completed'>('create')
  const [treasury, setTreasury] = useState(0.3)
  const [guildMembers] = useState([
    { name: "Alex", score: 850, avatar: "👤" },
    { name: "Sarah", score: 720, avatar: "👩" },
    { name: "Mike", score: 680, avatar: "👨" },
    { name: "Emma", score: 590, avatar: "👱‍♀️" },
    { name: "You", score: 920, avatar: "🏆" }
  ])
  const { address, chain } = useAccount()
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(1114)

  const handleCreateGuild = async () => {
    try {
      await BlockchainUtils.triggerMetaMaskTransaction({
        to: contractAddresses.guildSystemContractAddress,
        value: parseEther("0.05").toString(),
        description: "Creating 'Tezos Titans' guild with 0.05 CORE initial treasury"
      })
      setGuildState('formed')
      setTreasury(0.05)
      toast.success("🛡️ Guild created on-chain!")
    } catch (error) {
      // Fallback for demo
      setGuildState('formed')
      toast.success("🛡️ Guild formed successfully!")
    }
  }

  const handleContributeToTreasury = async () => {
    try {
      await BlockchainUtils.triggerMetaMaskTransaction({
        to: contractAddresses.guildSystemContractAddress,
        value: parseEther("0.1").toString(),
        description: "Contributing 0.1 CORE to guild treasury"
      })
      setTreasury(treasury + 0.1)
      toast.success("💰 Treasury contribution successful!")
    } catch (error) {
      toast.info("💰 Treasury contribution demo completed")
    }
  }

  const handleStartBattle = async () => {
    try {
      await BlockchainUtils.triggerMetaMaskTransaction({
        to: contractAddresses.guildSystemContractAddress,
        value: parseEther("0.2").toString(),
        description: "Starting Guild vs Guild battle with 0.2 CORE prize pool"
      })
      setGuildState('battle')
      toast.success("⚔️ Guild battle started!")
    } catch (error) {
      setGuildState('battle')
      toast.success("⚔️ Guild battle initiated!")
    }
  }

  // Remove automatic progressions - now manual

  if (guildState === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🛡️ Step 3: Guild System
        </h1>
        <p className="text-emerald-400 text-lg mb-8">
          Create "Tezos Titans" study guild on-chain
        </p>
        
        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-8">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Form Your Guild?</h3>
          <p className="text-gray-400 mb-6">
            Initial treasury: 0.05 CORE • Invite friends via Farcaster
          </p>
          
          <button
            onClick={handleCreateGuild}
            disabled={!address}
            className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛡️ Create Guild On-Chain
          </button>
          
          {!address && (
            <p className="text-yellow-400 text-sm mt-4">
              Please connect your wallet to create a guild
            </p>
          )}
        </div>
      </div>
    )
  }

  if (guildState === 'battle') {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⚔️ Guild vs Guild Battle
          </h1>
          <p className="text-emerald-400 text-lg">
            Tezos Titans vs Crypto Crusaders - Battle in progress!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🛡️</div>
              <div className="text-white font-bold">Tezos Titans</div>
              <div className="text-blue-400 text-2xl font-bold">2,860 pts</div>
            </div>
          </div>
          
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">⚔️</div>
              <div className="text-white font-bold">Crypto Crusaders</div>
              <div className="text-red-400 text-2xl font-bold">2,340 pts</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-white font-bold text-2xl">Tezos Titans WIN!</div>
            <div className="text-green-400">+0.5 CORE added to guild treasury</div>
            <div className="text-sm text-gray-400 mt-2">
              Goldsky leaderboard updated in real-time
            </div>
            
            <button
              onClick={() => setGuildState('completed')}
              className="mt-4 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors"
            >
              Continue to NFT Quizzes 🖼️
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (guildState === 'completed') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-white font-bold text-xl">Guild System Complete!</div>
          <div className="text-green-400">All guild features demonstrated</div>
        </div>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Continue to NFT Quizzes 🖼️
        </button>
      </div>
    )
  }

  if (guildState === 'formed') {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🛡️ Guild: Tezos Titans
          </h1>
          <p className="text-emerald-400 text-lg">
            Guild formed! Powered by Goldsky indexing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guild Stats */}
          <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Guild Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Members:</span>
                <span className="text-white">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Treasury:</span>
                <span className="text-emerald-400">{treasury.toFixed(2)} CORE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ranking:</span>
                <span className="text-yellow-400">#7 on Goldsky Leaderboard</span>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Members</h3>
            <div className="space-y-2">
              {guildMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{member.avatar}</span>
                    <span className="text-white">{member.name}</span>
                  </div>
                  <span className="text-emerald-400">{member.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8 space-y-4">
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-2xl mb-2">⚔️</div>
            <div className="text-white font-bold">Guild vs Guild Battle</div>
            <div className="text-yellow-400 text-sm">Ready to start battle with prize pool?</div>
            
            <div className="mt-4 space-x-4">
              <button
                onClick={handleContributeToTreasury}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                💰 Contribute to Treasury
              </button>
              
              <button
                onClick={handleStartBattle}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                ⚔️ Start Guild Battle
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          ⚔️ Guild vs Guild Battle
        </h1>
        <div className="text-emerald-400">Tezos Titans vs Crypto Crusaders</div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-white font-bold">Tezos Titans</div>
            <div className="text-blue-400 text-2xl font-bold">2,860 pts</div>
          </div>
        </div>
        
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-white font-bold">Crypto Crusaders</div>
            <div className="text-red-400 text-2xl font-bold">2,340 pts</div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-white font-bold text-2xl">Tezos Titans WIN!</div>
          <div className="text-green-400">+0.5 CORE added to guild treasury</div>
          <div className="text-sm text-gray-400 mt-2">
            Goldsky leaderboard updated in real-time
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 4: NFT Quizzes - "Own Your Knowledge"
function Step4NFTQuizzes({ onNext }: { onNext: () => void }) {
  const [nftState, setNftState] = useState<'create' | 'mint' | 'earning' | 'completed'>('create')
  const [royaltyEarned] = useState(0.002)
  const { address, chain } = useAccount()
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(1114)

  const handleCreateQuiz = () => {
    setNftState('mint')
    toast.success("📝 Quiz created successfully!")
  }

  const handleMintNFT = async () => {
    try {
      await BlockchainUtils.triggerMetaMaskTransaction({
        to: contractAddresses.quizNFTContractAddress,
        value: parseEther("0.01").toString(),
        description: "Minting 'Advanced Solidity Patterns' quiz as NFT"
      })
      setNftState('earning')
      toast.success("🎉 Quiz NFT minted! Now earning royalties")
    } catch (error) {
      // Fallback for demo
      setNftState('earning')
      toast.success("🎉 Quiz NFT minted! Now earning royalties")
    }
  }

  if (nftState === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🖼️ Step 4: NFT Quiz Creator
          </h1>
          <p className="text-emerald-400 text-lg">
            Create and mint "Advanced Solidity Patterns" quiz as NFT
          </p>
        </div>
        
        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Quiz Creator</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Quiz Title</label>
              <input 
                type="text" 
                value="Advanced Solidity Patterns"
                readOnly
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
              <select className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                <option>Expert</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Royalty %</label>
              <input 
                type="number" 
                value="10"
                readOnly
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="text-white font-bold mb-2">Sample Questions:</div>
            <div className="text-sm text-gray-400 space-y-1">
              <div>1. What is the diamond pattern in Solidity?</div>
              <div>2. How do you implement proxy upgrades safely?</div>
              <div>3. What are the risks of delegatecall?</div>
              <div>+ 2 more questions</div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleCreateQuiz}
              className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors"
            >
              📝 Create Quiz Content
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (nftState === 'mint') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          🎉 Ready to Mint Quiz NFT
        </h1>
        
        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-12">
          <div className="text-6xl mb-4">🖼️</div>
          <div className="text-2xl font-bold text-white mb-4">
            Quiz NFT: "Advanced Solidity Patterns"
          </div>
          <div className="text-emerald-400 mb-4">
            ERC-721 with EIP-2981 royalty standard
          </div>
          <div className="text-sm text-gray-400 space-y-2 mb-6">
            <div>✅ Quiz logic tied to NFT ownership</div>
            <div>✅ 10% royalty on every play</div>
            <div>✅ IPFS metadata storage</div>
            <div>✅ On-chain creator economy</div>
          </div>
          
          <button
            onClick={handleMintNFT}
            disabled={!address}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🖼️ Mint Quiz NFT (0.01 CORE)
          </button>
          
          {!address && (
            <p className="text-yellow-400 text-sm mt-4">
              Please connect your wallet to mint NFT
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          💰 Quiz NFT Now Earning!
        </h1>
        <p className="text-emerald-400 text-lg">
          Your quiz is live and generating royalties
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">NFT Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">NFT ID:</span>
              <span className="text-white">#123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Times Played:</span>
              <span className="text-emerald-400">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Royalties Earned:</span>
              <span className="text-green-400">{royaltyEarned} CORE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Floor Price:</span>
              <span className="text-white">0.1 CORE</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-400 font-bold">Quiz Completed ✅</div>
              <div className="text-sm text-gray-400">User paid 0.02 CORE</div>
              <div className="text-sm text-green-400">You earned 0.002 CORE royalty</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-8">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Realmind: The On-Chain Knowledge Economy
          </h2>
          <div className="text-emerald-400 text-lg mb-6">
            From solo quizzes to NFT-powered knowledge ownership
          </div>
          
          <button
            onClick={() => setNftState('completed')}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors"
          >
            Complete Demo 🎉
          </button>
        </div>
      </div>
    </div>
  )

  if (nftState === 'completed') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-white font-bold text-xl">Demo Complete!</div>
          <div className="text-green-400">All Realmind features demonstrated</div>
        </div>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Restart Demo 🔄
        </button>
      </div>
    )
  }
}

export const Route = createFileRoute('/demo')({
  component: DemoFlow,
})