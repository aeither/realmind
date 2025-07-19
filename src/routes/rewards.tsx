import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Coins, Image, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const rewards = [
  {
    id: 1,
    name: "Legendary NFT Collection",
    description: "Rare digital artwork from top creators",
    cost: 500,
    type: "NFT",
    icon: <Image className="w-6 h-6" />,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    rarity: "Legendary",
  },
  {
    id: 2,
    name: "Epic NFT Collection",
    description: "High-quality digital collectibles",
    cost: 250,
    type: "NFT",
    icon: <Image className="w-6 h-6" />,
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    rarity: "Epic",
  },
  {
    id: 3,
    name: "100 METIS Tokens",
    description: "Native Metis network tokens",
    cost: 300,
    type: "Token",
    icon: <Coins className="w-6 h-6" />,
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    rarity: "Token",
  },
  {
    id: 4,
    name: "50 METIS Tokens",
    description: "Native Metis network tokens",
    cost: 150,
    type: "Token",
    icon: <Coins className="w-6 h-6" />,
    color: "bg-gradient-to-r from-green-400 to-green-600",
    rarity: "Token",
  },
  {
    id: 5,
    name: "Rare NFT Collection",
    description: "Limited edition digital art pieces",
    cost: 100,
    type: "NFT",
    icon: <Image className="w-6 h-6" />,
    color: "bg-gradient-to-r from-orange-500 to-red-500",
    rarity: "Rare",
  },
  {
    id: 6,
    name: "Power-up Boost",
    description: "2x ticket multiplier for next quiz",
    cost: 75,
    type: "Boost",
    icon: <Zap className="w-6 h-6" />,
    color: "bg-gradient-to-r from-yellow-500 to-orange-500",
    rarity: "Boost",
  },
];

const Rewards = () => {
  const [totalTickets, setTotalTickets] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const savedData = localStorage.getItem("quizData");
    if (savedData) {
      const data = JSON.parse(savedData);
      setTotalTickets(data.totalTickets || 0);
    }
  }, []);

  const handleClaim = (reward: (typeof rewards)[0]) => {
    if (totalTickets >= reward.cost) {
      const newTicketCount = totalTickets - reward.cost;
      setTotalTickets(newTicketCount);

      // Update localStorage
      const savedData = localStorage.getItem("quizData");
      if (savedData) {
        const data = JSON.parse(savedData);
        data.totalTickets = newTicketCount;
        localStorage.setItem("quizData", JSON.stringify(data));
      }

      toast({
        title: "Reward Claimed! 🎉",
        description: `You successfully claimed ${reward.name}!`,
      });
    } else {
      toast({
        title: "Insufficient Tickets",
        description: `You need ${reward.cost - totalTickets} more tickets to claim this reward.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm hover:opacity-80"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quizzes</span>
            </Link>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{totalTickets} Tickets</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Rewards Store</h1>
            <p className="text-white/80">
              Spend your tickets on amazing rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="max-w-md mx-auto p-6 space-y-4">
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-0">
              <div className={`${reward.color} p-4 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {reward.icon}
                    <span className="text-xs font-medium opacity-90">
                      {reward.rarity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{reward.cost}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{reward.name}</h3>
                <p className="text-white/80 text-sm">{reward.description}</p>
              </div>

              <div className="p-4">
                <Button
                  onClick={() => handleClaim(reward)}
                  disabled={totalTickets < reward.cost}
                  className="w-full"
                  variant={totalTickets >= reward.cost ? "default" : "outline"}
                >
                  {totalTickets >= reward.cost
                    ? "Claim Reward"
                    : `Need ${reward.cost - totalTickets} more tickets`}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {totalTickets === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Tickets Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Complete quizzes to earn tickets and unlock amazing rewards!
              </p>
              <Link to="/">
                <Button variant="outline">Start Playing</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/rewards")({
  component: Rewards,
});

export default Rewards;
