import { createFileRoute } from "@tanstack/react-router";
import { useFarcaster } from "./layout";
import { useToast } from "@/hooks/use-toast";

function FarcasterHome() {
  const { sdk, isInFrame, user } = useFarcaster();
  const { toast } = useToast();

  const handleFrameAction = async () => {
    if (!sdk) {
      toast({
        title: "Not in Frame",
        description: "This action requires running inside Farcaster",
        variant: "destructive",
      });
      return;
    }

    try {
      // Example frame action
      await sdk.actions.openUrl("https://quizarena.app");
      toast({
        title: "Success!",
        description: "Action completed in Farcaster frame",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform frame action",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Quiz Arena
            {isInFrame && (
              <span className="text-purple-400"> • Farcaster Mini App</span>
            )}
          </h1>
          <p className="text-xl text-gray-300">
            Test your knowledge and earn rewards
          </p>
        </div>

        {isInFrame ? (
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-xl font-semibold">
                Welcome {user?.username || "Farcaster User"}!
              </h2>
              <p className="text-gray-300 mt-2">
                You're running Quiz Arena inside Farcaster
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleFrameAction}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Start Quiz Challenge
              </button>

              <div className="text-center text-sm text-gray-400">
                <p>Frame SDK Status: ✅ Connected</p>
                <p>User: {user?.fid ? `FID ${user.fid}` : "Anonymous"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h2 className="text-xl font-semibold">Standalone Mode</h2>
              <p className="text-gray-300 mt-2 mb-4">
                This page is optimized for Farcaster frames but can run anywhere
              </p>

              <button
                onClick={() => window.open("https://warpcast.com", "_blank")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Open in Farcaster
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Powered by Farcaster Frame SDK v0.1.7</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/farcaster/")({
  component: FarcasterHome,
});
