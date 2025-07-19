import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext } from "react";

interface FarcasterContextType {
  sdk: any | null;
  isInFrame: boolean;
  user: any | null;
  isLoading: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  sdk: null,
  isInFrame: false,
  user: null,
  isLoading: true,
});

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (!context) {
    throw new Error("useFarcaster must be used within FarcasterProvider");
  }
  return context;
};

function FarcasterLayout() {
  const [sdk, setSdk] = useState<any | null>(null);
  const [isInFrame, setIsInFrame] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Check if we're in a Farcaster frame by looking for frame-specific properties
        const isInFarcasterFrame =
          window.location.search.includes("fid=") ||
          window.location.search.includes("frame=") ||
          window.location.search.includes("farcaster=") ||
          document.referrer.includes("farcaster") ||
          window.parent !== window;

        if (isInFarcasterFrame) {
          setIsInFrame(true);

          // Create a simple SDK mock that handles the ready() call
          const mockSDK = {
            context: Promise.resolve({
              user: {
                displayName: "Farcaster User",
                username: "farcaster_user",
              },
            }),
            actions: {
              ready: async () => {
                console.log("Farcaster SDK ready() called successfully");
                // Send a message to the parent frame to indicate we're ready
                if (window.parent !== window) {
                  try {
                    window.parent.postMessage({ type: "ready" }, "*");
                  } catch (e) {
                    console.warn("Could not send ready message to parent:", e);
                  }
                }
                return Promise.resolve();
              },
            },
          };

          setSdk(mockSDK);
          setUser({
            displayName: "Farcaster User",
            username: "farcaster_user",
          });

          // Call ready() to dismiss the splash screen
          try {
            await mockSDK.actions.ready();
          } catch (readyError) {
            console.warn("Failed to call sdk.actions.ready():", readyError);
          }

          // Add frame-specific styling
          document.body.classList.add("farcaster-frame");
        } else {
          console.log("Not running in Farcaster frame");
          setIsInFrame(false);

          // Create a standalone SDK mock
          const standaloneSDK = {
            context: Promise.resolve(null),
            actions: {
              ready: async () => {
                console.log("Farcaster SDK ready() called (standalone mode)");
                return Promise.resolve();
              },
            },
          };

          setSdk(standaloneSDK);
        }
      } catch (error) {
        console.log("Farcaster initialization failed:", error);
        setIsInFrame(false);
      } finally {
        setIsLoading(false);
      }
    };

    initFarcaster();
  }, []);

  const contextValue: FarcasterContextType = {
    sdk,
    isInFrame,
    user,
    isLoading,
  };

  return (
    <FarcasterContext.Provider value={contextValue}>
      <div
        className={`farcaster-container ${isInFrame ? "in-frame" : "standalone"}`}
      >
        {isInFrame && (
          <div className="frame-header bg-purple-600 text-white p-2 text-sm">
            Running in Farcaster • User:{" "}
            {user?.displayName || user?.username || "Anonymous"}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing Farcaster...</p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </FarcasterContext.Provider>
  );
}

export const Route = createFileRoute("/farcaster/layout")({
  component: FarcasterLayout,
});
