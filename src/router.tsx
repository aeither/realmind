import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexProvider } from "convex/react";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";

// Create a new router instance
export const createRouter = () => {
  // Initialize Convex client
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    console.warn("VITE_CONVEX_URL not found - Convex features will be disabled");
  }
  
  const convexQueryClient = CONVEX_URL ? new ConvexQueryClient(CONVEX_URL) : null;
  
  // Create query client with Convex integration
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient?.hashFn() || TanstackQuery.getContext().queryClient.getDefaultOptions().queries?.queryKeyHashFn,
        queryFn: convexQueryClient?.queryFn() || TanstackQuery.getContext().queryClient.getDefaultOptions().queries?.queryFn,
      },
    },
  });

  // Connect Convex query client if available
  if (convexQueryClient) {
    convexQueryClient.connect(queryClient);
  }

  const router = routerWithQueryClient(
    createTanstackRouter({
      routeTree,
      context: {
        queryClient,
        trpc: TanstackQuery.getContext().trpc,
      },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,

      Wrap: (props: { children: React.ReactNode }) => {
        if (convexQueryClient) {
          return (
            <ConvexProvider client={convexQueryClient.convexClient}>
              <TanstackQuery.Provider>{props.children}</TanstackQuery.Provider>
            </ConvexProvider>
          );
        }
        return (
          <TanstackQuery.Provider>{props.children}</TanstackQuery.Provider>
        );
      },
    }),
    queryClient
  );

  return router;
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
