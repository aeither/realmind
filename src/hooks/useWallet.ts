import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const useWallet = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(1000);
  const { toast } = useToast();

  const connectWallet = async () => {
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setWalletAddress(mockAddress);
      setIsWalletConnected(true);
      toast({
        title: "Wallet Connected! 🎉",
        description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      });
    }, 1500);
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setIsWalletConnected(false);
    setWalletBalance(1000);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const handleDeposit = (amount: number) => {
    if (walletBalance >= amount) {
      setWalletBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  const handleClaimReward = (amount: number) => {
    setWalletBalance(prev => prev + amount);
  };

  return {
    isWalletConnected,
    walletAddress,
    walletBalance,
    connectWallet,
    disconnectWallet,
    handleDeposit,
    handleClaimReward
  };
}; 