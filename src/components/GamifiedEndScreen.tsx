import { useState, useEffect } from 'react';

interface GamifiedEndScreenProps {
  score: number;
  totalQuestions: number;
  onClaim: () => void;
  onPlayAgain: () => void;
  onExit: () => void;
  isClaiming?: boolean;
  transactionHash?: string;
}

function GamifiedEndScreen({ 
  score, 
  totalQuestions, 
  onClaim, 
  onPlayAgain, 
  onExit,
  isClaiming = false,
  transactionHash
}: GamifiedEndScreenProps) {
  const [showBox, setShowBox] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const percentage = Math.round((score / totalQuestions) * 100);
  const pointsEarned = score * 10;
  const bonusMultiplier = percentage >= 80 ? 2 : percentage >= 60 ? 1.5 : 1;
  const totalPoints = Math.floor(pointsEarned * bonusMultiplier);

  // Animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowBox(true), 500);
    return () => clearTimeout(timer1);
  }, []);

  const handleOpenBox = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpened(true);
      setTimeout(() => setShowRewards(true), 500);
    }, 1000);
  };

  const handleClaim = () => {
    setHasClaimed(true);
    onClaim();
  };

  const getRewardEmoji = () => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🥇";
    if (percentage >= 70) return "🥈";
    if (percentage >= 60) return "🥉";
    return "📚";
  };

  const getRewardTitle = () => {
    if (percentage >= 90) return "Perfect!";
    if (percentage >= 80) return "Excellent!";
    if (percentage >= 70) return "Great Job!";
    if (percentage >= 60) return "Good Work!";
    return "Keep Learning!";
  };

  const getRewardColor = () => {
    if (percentage >= 90) return "#FFD700";
    if (percentage >= 80) return "#C0C0C0";
    if (percentage >= 70) return "#CD7F32";
    return "#4A90E2";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Confetti Animation */}
      {showRewards && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "8px",
                height: "8px",
                backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][i % 5],
                borderRadius: "50%",
                animation: `confetti 3s ease-out ${i * 0.1}s forwards`,
                left: `${Math.random() * 100}%`,
                top: "-10px"
              }}
            />
          ))}
        </div>
      )}

      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "24px",
        padding: "3rem",
        textAlign: "center",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        backdropFilter: "blur(10px)",
        position: "relative",
        zIndex: 2
      }}>
        {/* Score Display */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "1rem"
          }}>
            🎉 Quiz Completed!
          </h2>
          <div style={{
            fontSize: "4rem",
            marginBottom: "1rem",
            animation: showRewards ? "bounce 0.6s ease-in-out" : "none"
          }}>
            {getRewardEmoji()}
          </div>
          <h3 style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: getRewardColor(),
            marginBottom: "0.5rem"
          }}>
            {getRewardTitle()}
          </h3>
          <p style={{
            fontSize: "1.5rem",
            color: "#6b7280",
            marginBottom: "2rem"
          }}>
            {score}/{totalQuestions} ({percentage}%)
          </p>
        </div>

        {/* Surprise Box */}
        {!isOpened && (
          <div style={{
            marginBottom: "2rem",
            animation: showBox ? "slideInUp 0.5s ease-out" : "none",
            opacity: showBox ? 1 : 0,
            transform: showBox ? "translateY(0)" : "translateY(50px)"
          }}>
            <div
              onClick={!isOpening ? handleOpenBox : undefined}
              style={{
                width: "120px",
                height: "120px",
                margin: "0 auto",
                background: "linear-gradient(45deg, #FFD700, #FFA500)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                cursor: isOpening ? "default" : "pointer",
                boxShadow: "0 8px 16px rgba(255, 215, 0, 0.3)",
                transition: "all 0.3s ease",
                animation: isOpening ? "shake 0.5s ease-in-out" : "pulse 2s infinite",
                transform: isOpening ? "scale(1.1)" : "scale(1)"
              }}
              onMouseEnter={(e) => {
                if (!isOpening) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isOpening) {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              {isOpening ? "🎁" : "📦"}
            </div>
            <p style={{
              marginTop: "1rem",
              fontSize: "1.2rem",
              color: "#6b7280",
              fontWeight: "600"
            }}>
              {isOpening ? "Opening..." : "Click to open your reward!"}
            </p>
          </div>
        )}

        {/* Rewards Display */}
        {showRewards && (
          <div style={{
            animation: "fadeInUp 0.5s ease-out",
            marginBottom: "2rem"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              borderRadius: "16px",
              padding: "2rem",
              border: "2px solid #0ea5e9"
            }}>
              <h4 style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#0c4a6e",
                marginBottom: "1rem"
              }}>
                🍋 Rewards Earned!
              </h4>
              <div style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                marginBottom: "1rem"
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div>
                  <div style={{ fontWeight: "bold", color: "#374151" }}>Base Points</div>
                  <div style={{ fontSize: "1.2rem", color: "#059669" }}>{pointsEarned}</div>
                </div>
                <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>×</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
                  <div style={{ fontWeight: "bold", color: "#374151" }}>Bonus</div>
                  <div style={{ fontSize: "1.2rem", color: "#dc2626" }}>{bonusMultiplier}x</div>
                </div>
                <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>=</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
                  <div style={{ fontWeight: "bold", color: "#374151" }}>Total</div>
                  <div style={{ fontSize: "1.5rem", color: "#059669", fontWeight: "bold" }}>{totalPoints}</div>
                </div>
              </div>
              <p style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                marginTop: "1rem"
              }}>
                {bonusMultiplier > 1 ? `You earned a ${bonusMultiplier}x bonus for your excellent performance!` : "Keep practicing to earn bonus multipliers!"}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          {showRewards && !hasClaimed && (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              style={{
                backgroundColor: isClaiming ? "#9ca3af" : "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: isClaiming ? "not-allowed" : "pointer",
                boxShadow: "0 4px 6px rgba(34, 197, 94, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                if (!isClaiming) {
                  e.currentTarget.style.backgroundColor = "#16a34a";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isClaiming) {
                  e.currentTarget.style.backgroundColor = "#22c55e";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isClaiming ? "Claiming..." : "🎁 Claim Rewards"}
            </button>
          )}

          {hasClaimed && (
            <button
              onClick={onPlayAgain}
              style={{
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5a67d8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#667eea";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              🔄 Play Again
            </button>
          )}

          <button
            onClick={onExit}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4b5563";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6b7280";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Exit Quiz
          </button>
        </div>

        {/* Transaction Hash */}
        {transactionHash && (
          <div style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#e6f7ff",
            borderRadius: "8px",
            border: "1px solid #0ea5e9"
          }}>
            <p style={{ fontWeight: "600", marginBottom: "0.5rem", color: "#0c4a6e" }}>
              🔗 Transaction Hash:
            </p>
            <p style={{
              fontSize: "0.8rem",
              wordBreak: "break-all",
              fontFamily: "monospace",
              color: "#0c4a6e",
              backgroundColor: "white",
              padding: "0.5rem",
              borderRadius: "4px"
            }}>
              {transactionHash}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: scale(1.1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-5deg); }
          75% { transform: scale(1.1) rotate(5deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default GamifiedEndScreen; 