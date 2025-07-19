import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, Coins, Star, Trophy, Wallet } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface QuizCardProps {
  title: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
  isCompleted: boolean;
  onComplete: (tickets: number) => void;
  isWalletConnected: boolean;
}

export const QuizCard = ({ 
  title, 
  category, 
  icon, 
  color, 
  quiz, 
  isCompleted, 
  onComplete,
  isWalletConnected
}: QuizCardProps) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasDeposited, setHasDeposited] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showClaimButton, setShowClaimButton] = useState(false);
  const { toast } = useToast();
  
  // Refs to track component mount status and timers
  const isMountedRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear all timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const handleDeposit = () => {
    setHasDeposited(true);
    toast({
      title: "Ready to Play! 💰",
      description: "Quiz unlocked, let's start!",
    });
    // Auto-start quiz after deposit
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        startQuiz();
      }
    }, 1000);
    timeoutRefs.current.push(timeout);
  };

  const startQuiz = () => {
    if (!isMountedRef.current) return;
    
    setIsActive(true);
    setTimeLeft(10);
    setSelectedAnswer(null);
    setShowResult(false);

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return;
      }
      
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    if (!isMountedRef.current) return;
    
    setShowResult(true);
    toast({
      title: "Time's up!",
      description: "You didn't answer in time. Try again tomorrow!",
      variant: "destructive",
    });
    
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        setIsActive(false);
        setShowResult(false);
      }
    }, 2000);
    timeoutRefs.current.push(timeout);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !isMountedRef.current) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === quiz.correctAnswer;
    const speed = 11 - timeLeft; // Higher speed = more tickets
    const baseTickets = Math.max(5, 50 - speed * 5);
    const randomMultiplier = Math.random() * 0.5 + 0.75; // 0.75x to 1.25x multiplier
    const tickets = isCorrect ? Math.floor(baseTickets * randomMultiplier) : 0;
    
    if (isCorrect) {
      const reward = tickets * 2; // Double tickets as reward tokens
      setRewardAmount(reward);
      setShowClaimButton(true);
      onComplete(tickets);
      toast({
        title: "Correct! 🎉",
        description: `You earned ${tickets} tickets! Claim ${reward} QT tokens!`,
        variant: "default",
      });
    } else {
      toast({
        title: "Wrong answer 😔",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }

    const timeout = setTimeout(() => {
      if (!isCorrect && isMountedRef.current) {
        setIsActive(false);
        setShowResult(false);
      }
    }, 2000);
    timeoutRefs.current.push(timeout);
  };

  const handleClaimReward = () => {
    if (!isMountedRef.current) return;
    
    setShowClaimButton(false);
    toast({
      title: "Reward Claimed! 💰",
      description: `Claimed ${rewardAmount} QT tokens!`,
    });
    
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        setIsActive(false);
        setShowResult(false);
        setHasDeposited(false);
      }
    }, 1500);
    timeoutRefs.current.push(timeout);
  };

  if (isActive && !showResult) {
    return (
      <Card className="h-80 bg-card shadow-card animate-bounce-in">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${color}`}>
                {icon}
              </div>
              <span className="font-semibold text-card-foreground">{title}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Clock className="w-4 h-4" />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-6 text-center text-card-foreground">
              {quiz.question}
            </h3>
            
            <div className="space-y-3">
              {quiz.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto py-3 hover:bg-accent/50"
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const isCorrect = selectedAnswer === quiz.correctAnswer;
    return (
      <Card className="h-80 bg-card shadow-card">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center">
          <div className={`p-4 rounded-full mb-4 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
            {isCorrect ? <Trophy className="w-8 h-8 text-white" /> : <span className="text-2xl">😔</span>}
          </div>
          <h3 className="text-xl font-bold mb-2 text-center">
            {isCorrect ? 'Correct!' : 'Wrong Answer'}
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            {isCorrect ? `You earned ${Math.floor(rewardAmount/2)} tickets!` : `The correct answer was: ${quiz.options[quiz.correctAnswer]}`}
          </p>
          
          {showClaimButton && (
            <Button 
              variant="default" 
              size="lg"
              onClick={handleClaimReward}
              className="animate-pulse"
            >
              <Coins className="w-5 h-5 mr-2" />
              Claim {rewardAmount} QT
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-80 bg-card shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-card-foreground">{title}</h3>
            <p className="text-muted-foreground text-sm">{category}</p>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-center">
          {isCompleted ? (
            <div className="text-center">
              <div className="p-3 rounded-full bg-green-500 mb-4 inline-flex">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-green-600 font-semibold">Completed!</p>
              <p className="text-muted-foreground text-sm">Come back tomorrow</p>
            </div>
          ) : !isWalletConnected ? (
            <div className="text-center">
              <div className="p-3 rounded-full bg-muted mb-4 inline-flex">
                <Wallet className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2 font-semibold">Connect Wallet Required</p>
              <p className="text-muted-foreground text-sm">
                Connect your wallet to deposit and play
              </p>
            </div>
          ) : !hasDeposited ? (
            <div className="text-center">
              <div className="p-3 rounded-full bg-orange-500 mb-4 inline-flex">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                Click to unlock this quiz!
              </p>
              <Button 
                variant="default" 
                size="lg"
                onClick={handleDeposit}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Play Quiz
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                Answer fast to earn more tickets! Rewards are randomized!
              </p>
              <Button 
                variant="default" 
                size="lg"
                onClick={startQuiz}
                className="animate-pulse"
              >
                Start Quiz
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 