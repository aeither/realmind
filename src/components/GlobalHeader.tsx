import { Link } from '@tanstack/react-router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { getContractAddresses } from '../libs/constants';

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
  const { address, chain } = useAccount();
  
  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(133717); // Default to Hyperion (Testnet)

  // Get Token1 balance
  const { data: tokenBalance } = useBalance({
    address,
    token: contractAddresses.token1ContractAddress as `0x${string}`,
    chainId: chain?.id,
  });

  // TODO: Fix token balance display
  console.log("tokenBalance", tokenBalance);
  
  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(55, 65, 81, 0.3)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 10px rgba(0, 255, 135, 0.2)"
    }}>
      {/* Left side - Logo and Back button */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {showBackButton && (
          <Link
            to={backTo}
            style={{
              color: "#00ff87",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#00cc6a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#00ff87";
            }}
          >
            {backText}
          </Link>
        )}
        
        <Link
          to="/"
          style={{
            color: "#00ff87",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          🏛️ Realmind
        </Link>
      </div>

      {/* Center - Navigation */}
      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            color: "#e5e7eb",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00ff87";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#e5e7eb";
          }}
        >
          Home
        </Link>
        {/* <Link
          to="/landing"
          style={{
            color: "#e5e7eb",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00ff87";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#e5e7eb";
          }}
        >
          Landing
        </Link> */}
        <Link
          to="/demo"
          style={{
            color: "#e5e7eb",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00ff87";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#e5e7eb";
          }}
        >
          🎮 Play
        </Link>
        {/* <Link
          to="/contract"
          style={{
            color: "#e5e7eb",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00ff87";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#e5e7eb";
          }}
        >
          Debug
        </Link> */}
      </nav>

      {/* Right side - Token Balance and Connect Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Token Balance Display */}
        {address && tokenBalance && (
          <div style={{
            background: "rgba(0, 255, 135, 0.1)",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            border: "1px solid rgba(0, 255, 135, 0.2)"
          }}>
            <div style={{
              color: "#00ff87",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>🪙</span>
              <span>{parseFloat(tokenBalance.value.toString()).toFixed(2)} {tokenBalance.symbol}</span>
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