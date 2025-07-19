import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "../../components/ClientOnly";
import { FarcasterQuizApp } from "../../components/FarcasterQuizApp";

function QuizAppWrapper() {
  return (
    <ClientOnly
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              QuizDrop
            </div>
            <div style={{ fontSize: "1rem", opacity: 0.8, marginTop: "0.5rem" }}>
              Loading...
            </div>
          </div>
        </div>
      }
    >
      <FarcasterQuizApp />
    </ClientOnly>
  );
}

export const Route = createFileRoute("/farcaster/quiz-app")({
  component: QuizAppWrapper,
});

export default QuizAppWrapper;