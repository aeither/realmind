import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Target, Trophy } from "lucide-react";

interface StatsCardProps {
  totalTickets: number;
  todayTickets: number;
  streak: number;
}

export const StatsCard = ({
  totalTickets,
  todayTickets,
  streak,
}: StatsCardProps) => {
  return (
    <Card className="bg-card shadow-card">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">
          Your Stats
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="p-3 rounded-lg bg-blue-100 mb-2 inline-flex">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalTickets}</p>
            <p className="text-muted-foreground text-sm">Total Tickets</p>
          </div>
          <div className="text-center">
            <div className="p-3 rounded-lg bg-green-100 mb-2 inline-flex">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{todayTickets}</p>
            <p className="text-muted-foreground text-sm">Today's Tickets</p>
          </div>
          <div className="text-center">
            <div className="p-3 rounded-lg bg-orange-100 mb-2 inline-flex">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{streak}</p>
            <p className="text-muted-foreground text-sm">Day Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
