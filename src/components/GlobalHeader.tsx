import { Link } from '@tanstack/react-router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

interface GlobalHeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

function GlobalHeader({ 
  showBackButton = false, 
  backTo = "/", 
  backText = "← Back" 
}: GlobalHeaderProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
    }}>
      {/* Left side - Logo and Back button */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {showBackButton && (
          <Link
            to={backTo}
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#5a67d8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#667eea";
            }}
          >
            {backText}
          </Link>
        )}
        
        <Link
          to="/"
          style={{
            color: "#1f2937",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          🧠 RealMind
        </Link>
      </div>

      {/* Center - Navigation */}
      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          Home
        </Link>
        <Link
          to="/landing"
          style={{
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          Landing
        </Link>
        <Link
          to="/contract"
          style={{
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          Debug
        </Link>
      </nav>

      {/* Right side - Balance and Connect Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Balance Display */}
        {address && balance && (
          <div style={{
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            border: "1px solid rgba(102, 126, 234, 0.2)"
          }}>
            <div style={{
              color: "#667eea",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>💰</span>
              <span>{parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}</span>
            </div>
          </div>
        )}
        
        {/* RainbowKit Connect Button */}
        <ConnectButton />
      </div>
    </header>
  );
}

export default GlobalHeader; 