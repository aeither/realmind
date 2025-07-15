import { QuizCard } from "@/components/QuizCard";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialQuizzes } from "@/data/quizzes";
import { useQuizData } from "@/hooks/useQuizData";
import { useQuizGenerator } from "@/hooks/useQuizGenerator";
import { createFileRoute } from "@tanstack/react-router";
import { Coins, Crown, Gift, User, Wand2 } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

const Index = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const {
    completedQuizzes,
    totalTickets,
    todayTickets,
    streak,
    handleQuizComplete,
    resetCompletedQuizzes
  } = useQuizData();

  const {
    currentQuizzes,
    quizTopic,
    setQuizTopic,
    isGenerating,
    generateNewQuizzes
  } = useQuizGenerator(initialQuizzes);

  const handleGenerateQuizzes = async () => {
    const newQuizzes = await generateNewQuizzes();
    if (newQuizzes) {
      resetCompletedQuizzes();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          {/* Top row with wallet */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4" />
              <span className="font-medium">Quiz Arena</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-lg">
              <Gift className="w-4 h-4" />
              <span className="font-medium">{totalTickets} Tickets</span>
            </div>
            
            <ConnectButton 
              chainStatus="none"
              accountStatus="address"
              showBalance={false}
            />
          </div>

          {/* Main header content */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Welcome back!</h1>
                <p className="text-white/80 text-sm">
                  {isConnected ? "Ready to earn rewards?" : "Connect wallet to start"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg">{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Stats Card */}
        <StatsCard 
          totalTickets={totalTickets}
          todayTickets={todayTickets}
          streak={streak}
        />

        {/* Daily Quizzes Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Daily Quizzes</h2>
          <p className="text-muted-foreground">
            Complete all 3 quizzes to extend your streak!
          </p>
        </div>

        {/* Quiz Cards */}
        <div className="space-y-4">
          {currentQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              title={quiz.title}
              category={quiz.category}
              icon={quiz.icon}
              color={quiz.color}
              quiz={quiz.quiz}
              isCompleted={completedQuizzes.includes(quiz.id)}
              onComplete={(tickets) => handleQuizComplete(quiz.id, tickets)}
              isWalletConnected={isConnected}
            />
          ))}
        </div>

        {/* Quiz Generator */}
        {completedQuizzes.length === 3 && (
          <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="p-3 rounded-full bg-blue-600 mb-4 inline-flex">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-4">Generate New Quizzes! ✨</h3>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input
                placeholder="Enter quiz topic..."
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="flex-1"
                disabled={isGenerating}
              />
              <Button 
                onClick={handleGenerateQuizzes}
                disabled={isGenerating || !quizTopic.trim()}
                className="px-3"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
});

export default Index; 