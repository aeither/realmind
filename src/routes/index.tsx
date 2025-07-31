import { createFileRoute, Link } from '@tanstack/react-router'

function HomePage() {
  return (
    <div style={{ 
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: "center",
        padding: "4rem 2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px",
        color: "white",
        marginBottom: "3rem"
      }}>
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          🧠 Welcome to RealMind
        </h1>
        <p style={{
          fontSize: "1.4rem",
          marginBottom: "2rem",
          opacity: 0.95,
          maxWidth: "600px",
          margin: "0 auto 2rem"
        }}>
          Interactive learning platform that rewards users with Yuzu Points through 
          daily quizzes, quests, and challenges on the EDU Chain ecosystem.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/quiz-game"
            style={{
              display: "inline-block",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              border: "2px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🎮 Play Quiz Game
          </Link>
          
          <Link
            to="/farcaster"
            style={{
              display: "inline-block",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              border: "2px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🚀 Farcaster App
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem",
        marginBottom: "3rem"
      }}>
        <FeatureCard
          icon="🎮"
          title="Onchain Quiz Game"
          description="Play blockchain quizzes with real crypto rewards. Pay to play, earn up to 120% back based on performance!"
        />
        <FeatureCard
          icon="📚"
          title="Daily Learning"
          description="Take personalized daily quizzes to earn points and build your knowledge across various subjects."
        />
        <FeatureCard
          icon="🏆"
          title="Leaderboards"
          description="Compete with other learners in seasonal competitions and track your progress."
        />
        <FeatureCard
          icon="🍋"
          title="Yuzu Points"
          description="Earn points that convert to EDU tokens on the Open Campus EDU Chain ecosystem."
        />
      </div>

      {/* How It Works Section */}
      <div style={{
        background: "#f8fafc",
        borderRadius: "16px",
        padding: "3rem 2rem",
        textAlign: "center"
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "2rem"
        }}>
          How It Works
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          <StepCard
            step="1"
            title="Connect"
            description="Sign in with your Farcaster account to get started"
            color="#667eea"
          />
          <StepCard
            step="2"
            title="Learn"
            description="Take daily quizzes and complete educational quests"
            color="#22c55e"
          />
          <StepCard
            step="3"
            title="Earn"
            description="Accumulate points and climb the leaderboards"
            color="#f59e0b"
          />
          <StepCard
            step="4"
            title="Reward"
            description="Convert points to Yuzu Points for EDU Chain rewards"
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        textAlign: "center",
        padding: "3rem 2rem",
        marginTop: "3rem"
      }}>
        <h3 style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "1rem"
        }}>
          Ready to Start Learning?
        </h3>
        <p style={{
          fontSize: "1.1rem",
          color: "#6b7280",
          marginBottom: "2rem",
          maxWidth: "500px",
          margin: "0 auto 2rem"
        }}>
          Join thousands of learners already earning rewards through interactive education.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/quiz-game"
            style={{
              display: "inline-block",
              backgroundColor: "#667eea",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a67d8";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#667eea";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(102, 126, 234, 0.3)";
            }}
          >
            🎮 Play Quiz Game
          </Link>

          <Link
            to="/farcaster"
            style={{
              display: "inline-block",
              backgroundColor: "#8b5cf6",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(139, 92, 246, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#7c3aed";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 12px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#8b5cf6";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(139, 92, 246, 0.3)";
            }}
          >
            Launch Farcaster App →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: string; 
  title: string; 
  description: string; 
}) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "2rem",
      textAlign: "center",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      border: "1px solid #e5e7eb",
      transition: "all 0.3s ease"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 8px 12px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
    }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: "1rem"
      }}>
        {title}
      </h3>
      <p style={{
        color: "#6b7280",
        lineHeight: "1.6"
      }}>
        {description}
      </p>
    </div>
  );
}

function StepCard({ step, title, description, color }: {
  step: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "2rem",
      textAlign: "center",
      position: "relative",
      border: "1px solid #e5e7eb"
    }}>
      <div style={{
        width: "3rem",
        height: "3rem",
        backgroundColor: color,
        color: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        fontWeight: "bold",
        margin: "0 auto 1rem",
        boxShadow: `0 4px 8px ${color}40`
      }}>
        {step}
      </div>
      <h4 style={{
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: "0.5rem"
      }}>
        {title}
      </h4>
      <p style={{
        color: "#6b7280",
        fontSize: "0.95rem",
        lineHeight: "1.5"
      }}>
        {description}
      </p>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})