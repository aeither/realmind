import { Link } from '@tanstack/react-router';
import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

function Header({ 
  title = "🏛️ Realmind", 
  subtitle = "Interactive Learning Platform",
  showBackButton = false,
  backTo = "/landing",
  backText = "← Back to Landing"
}: HeaderProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });
  return (
    <div style={{
      position: "relative",
      textAlign: "center",
      marginBottom: "2rem"
    }}>
      {/* Back Button */}
      {showBackButton && (
        <div style={{
          position: "absolute",
          top: "0",
          left: "0",
          zIndex: 10
        }}>
          <Link
            to={backTo}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "1rem",
              opacity: 0.8,
              transition: "opacity 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
          >
            {backText}
          </Link>
        </div>
      )}

      {/* Balance Display */}
      {address && balance && (
        <div style={{
          position: "absolute",
          top: "0",
          right: "0",
          zIndex: 10,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "0.5rem 1rem",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <div style={{
            color: "white",
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

      {/* Title */}
      <h1 style={{
        fontSize: "3.5rem",
        fontWeight: "bold",
        marginBottom: "1rem",
        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        color: "white"
      }}>
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p style={{
          fontSize: "1.4rem",
          marginBottom: "2rem",
          opacity: 0.95,
          maxWidth: "600px",
          margin: "0 auto 2rem",
          color: "white"
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default Header; 