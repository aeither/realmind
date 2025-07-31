import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import React from 'react'
import { WagmiProvider } from "wagmi";
import { config } from "../wagmi";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div style={{ 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column",
          fontFamily: "system-ui, sans-serif"
        }}>
          {/* Navigation */}
          <nav style={{
            padding: "1rem",
            borderBottom: "1px solid #e5e7eb",
            background: "white",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "2rem"
            }}>
              <Link to="/" style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                textDecoration: "none",
                color: "#667eea"
              }}>
                🧠 RealMind
              </Link>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link 
                  to="/" 
                  style={{
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    color: "#374151",
                    fontWeight: "500"
                  }}
                  activeProps={{
                    style: {
                      backgroundColor: "#667eea",
                      color: "white"
                    }
                  }}
                >
                  Home
                </Link>
                <Link 
                  to="/quiz-game" 
                  style={{
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    color: "#374151",
                    fontWeight: "500"
                  }}
                  activeProps={{
                    style: {
                      backgroundColor: "#667eea",
                      color: "white"
                    }
                  }}
                >
                  Quiz Game
                </Link>
                <Link 
                  to="/farcaster" 
                  style={{
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    color: "#374151",
                    fontWeight: "500"
                  }}
                  activeProps={{
                    style: {
                      backgroundColor: "#667eea",
                      color: "white"
                    }
                  }}
                >
                  Farcaster App
                </Link>
              </div>
            </div>
          </nav>
          
          {/* Main Content */}
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
        </div>
        <TanStackRouterDevtools />
      </QueryClientProvider>
    </WagmiProvider>
  ),
})