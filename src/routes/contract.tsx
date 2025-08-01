import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useReadContract, 
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain
} from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { quizGameABI } from '../libs/quizGameABI'
import { quizGameContractAddress } from '../libs/constants'
import { hyperionTestnet } from '../wagmi'
import Header from '../components/Header'

function ContractDebugPage() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState<number>(42);
  const [submittedAnswer, setSubmittedAnswer] = useState<number>(42);
  const [playAmount, setPlayAmount] = useState<string>('0.001');

  // Read contract data
  const { data: contractPlayAmount, refetch: refetchPlayAmount } = useReadContract({
    abi: quizGameABI,
    address: quizGameContractAddress as `0x${string}`,
    functionName: 'playAmount',
    chainId: hyperionTestnet.id,
  });

  const { data: owner, refetch: refetchOwner } = useReadContract({
    abi: quizGameABI,
    address: quizGameContractAddress as `0x${string}`,
    functionName: 'owner',
    chainId: hyperionTestnet.id,
  });

  const { data: tokenAddress, refetch: refetchToken } = useReadContract({
    abi: quizGameABI,
    address: quizGameContractAddress as `0x${string}`,
    functionName: 'token',
    chainId: hyperionTestnet.id,
  });

  const { data: userSession, refetch: refetchSession } = useReadContract({
    abi: quizGameABI,
    address: quizGameContractAddress as `0x${string}`,
    functionName: 'getQuizSession',
    args: address ? [address] : undefined,
    chainId: hyperionTestnet.id,
  });

  // Write contract hooks
  const { 
    data: startQuizHash, 
    isPending: isStartPending,
    writeContract: startQuiz,
    error: startError,
    reset: resetStart
  } = useWriteContract();

  const { 
    data: completeQuizHash, 
    isPending: isCompletePending,
    writeContract: completeQuiz,
    error: completeError,
    reset: resetComplete
  } = useWriteContract();

  const { 
    data: withdrawHash, 
    isPending: isWithdrawPending,
    writeContract: withdraw,
    error: withdrawError,
    reset: resetWithdraw
  } = useWriteContract();

  const { 
    data: setPlayAmountHash, 
    isPending: isSetPlayAmountPending,
    writeContract: setPlayAmountFunc,
    error: setPlayAmountError,
    reset: resetSetPlayAmount
  } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isStartConfirming, isSuccess: isStartConfirmed } = 
    useWaitForTransactionReceipt({ hash: startQuizHash });

  const { isLoading: isCompleteConfirming, isSuccess: isCompleteConfirmed } = 
    useWaitForTransactionReceipt({ hash: completeQuizHash });

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed } = 
    useWaitForTransactionReceipt({ hash: withdrawHash });

  const { isLoading: isSetPlayAmountConfirming, isSuccess: isSetPlayAmountConfirmed } = 
    useWaitForTransactionReceipt({ hash: setPlayAmountHash });

  const isCorrectChain = chain?.id === hyperionTestnet.id;

  const handleStartQuiz = () => {
    if (!isConnected) return;
    
    resetStart();
    startQuiz({
      abi: quizGameABI,
      address: quizGameContractAddress as `0x${string}`,
      functionName: 'startQuiz',
      args: [BigInt(userAnswer)],
      value: parseEther(selectedAmount.toString()),
      chainId: hyperionTestnet.id,
    });
  };

  const handleCompleteQuiz = () => {
    if (!isConnected) return;
    
    resetComplete();
    completeQuiz({
      abi: quizGameABI,
      address: quizGameContractAddress as `0x${string}`,
      functionName: 'completeQuiz',
      args: [BigInt(submittedAnswer)],
      chainId: hyperionTestnet.id,
    });
  };

  const handleWithdraw = () => {
    if (!isConnected) return;
    
    resetWithdraw();
    withdraw({
      abi: quizGameABI,
      address: quizGameContractAddress as `0x${string}`,
      functionName: 'withdraw',
      chainId: hyperionTestnet.id,
    });
  };

  const handleSetPlayAmount = () => {
    if (!isConnected) return;
    
    resetSetPlayAmount();
    setPlayAmountFunc({
      abi: quizGameABI,
      address: quizGameContractAddress as `0x${string}`,
      functionName: 'setPlayAmount',
      args: [parseEther(playAmount)],
      chainId: hyperionTestnet.id,
    });
  };

  const handleRefetchAll = () => {
    refetchPlayAmount();
    refetchOwner();
    refetchToken();
    refetchSession();
  };

  if (!isConnected) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Header 
          title="🔧 Contract Debug"
          subtitle="Debug and test smart contract functions"
          showBackButton={true}
          backTo="/"
          backText="← Back to Home"
        />
        
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "3rem",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#1f2937" }}>
            Connect Wallet to Debug Contract
          </h2>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={{
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: "pointer",
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
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Header 
          title="🔧 Contract Debug"
          subtitle="Debug and test smart contract functions"
          showBackButton={true}
          backTo="/"
          backText="← Back to Home"
        />
        
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "3rem",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#ef4444" }}>
            ⚠️ Wrong Network
          </h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#6b7280" }}>
            Please switch to Hyperion Testnet to debug the contract.
          </p>
          <button
            onClick={() => switchChain({ chainId: hyperionTestnet.id })}
            style={{
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)"
            }}
          >
            Switch to Hyperion Testnet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem"
    }}>


      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "2rem"
      }}>
        {/* Contract Info */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            📋 Contract Information
          </h3>
          
          <div style={{ marginBottom: "1rem" }}>
            <strong>Contract Address:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "0.5rem",
              borderRadius: "6px",
              wordBreak: "break-all"
            }}>
              {quizGameContractAddress}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Connected Wallet:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {address}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Owner:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {owner || "Loading..."}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Current Play Amount:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {contractPlayAmount ? formatEther(contractPlayAmount) : "Loading..."} tMETIS
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Token Address:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {tokenAddress || "Loading..."}
            </p>
          </div>

          <button
            onClick={handleRefetchAll}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Quiz Functions */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            🎮 Quiz Functions
          </h3>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Amount (tMETIS):
            </label>
            <input
              type="number"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              User Answer:
            </label>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
            />
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isStartPending || isStartConfirming}
            style={{
              backgroundColor: isStartPending || isStartConfirming ? "#9ca3af" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isStartPending || isStartConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem"
            }}
          >
            {isStartPending ? "Confirming..." : isStartConfirming ? "Starting Quiz..." : "🚀 Start Quiz"}
          </button>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Submitted Answer:
            </label>
            <input
              type="number"
              value={submittedAnswer}
              onChange={(e) => setSubmittedAnswer(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
            />
          </div>

          <button
            onClick={handleCompleteQuiz}
            disabled={isCompletePending || isCompleteConfirming}
            style={{
              backgroundColor: isCompletePending || isCompleteConfirming ? "#9ca3af" : "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isCompletePending || isCompleteConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem"
            }}
          >
            {isCompletePending ? "Confirming..." : isCompleteConfirming ? "Completing Quiz..." : "✅ Complete Quiz"}
          </button>
        </div>

        {/* Admin Functions */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            👑 Admin Functions
          </h3>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              New Play Amount (tMETIS):
            </label>
            <input
              type="number"
              step="0.001"
              value={playAmount}
              onChange={(e) => setPlayAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
            />
          </div>

          <button
            onClick={handleSetPlayAmount}
            disabled={isSetPlayAmountPending || isSetPlayAmountConfirming}
            style={{
              backgroundColor: isSetPlayAmountPending || isSetPlayAmountConfirming ? "#9ca3af" : "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isSetPlayAmountPending || isSetPlayAmountConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem"
            }}
          >
            {isSetPlayAmountPending ? "Confirming..." : isSetPlayAmountConfirming ? "Setting Amount..." : "💰 Set Play Amount"}
          </button>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawPending || isWithdrawConfirming}
            style={{
              backgroundColor: isWithdrawPending || isWithdrawConfirming ? "#9ca3af" : "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isWithdrawPending || isWithdrawConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem"
            }}
          >
            {isWithdrawPending ? "Confirming..." : isWithdrawConfirming ? "Withdrawing..." : "💸 Withdraw Funds"}
          </button>
        </div>

        {/* User Session */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            👤 User Session
          </h3>

          {userSession ? (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Active:</strong> {userSession.active ? "✅ Yes" : "❌ No"}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>User Answer:</strong> {userSession.userAnswer.toString()}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Amount Paid:</strong> {formatEther(userSession.amountPaid)} tMETIS
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Timestamp:</strong> {new Date(Number(userSession.timestamp) * 1000).toLocaleString()}
              </div>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No active session found</p>
          )}
        </div>
      </div>

      {/* Transaction Status */}
      {(isStartPending || isStartConfirming || isCompletePending || isCompleteConfirming || 
        isWithdrawPending || isWithdrawConfirming || isSetPlayAmountPending || isSetPlayAmountConfirming) && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "12px",
          padding: "1rem",
          maxWidth: "400px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
        }}>
          <p style={{ margin: "0 0 0.5rem 0", color: "#92400e", fontWeight: "600" }}>
            🔄 Transaction in Progress
          </p>
          <p style={{ margin: 0, color: "#92400e", fontSize: "0.9rem" }}>
            {isStartPending || isStartConfirming ? "Starting quiz..." :
             isCompletePending || isCompleteConfirming ? "Completing quiz..." :
             isWithdrawPending || isWithdrawConfirming ? "Withdrawing funds..." :
             isSetPlayAmountPending || isSetPlayAmountConfirming ? "Setting play amount..." : ""}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {(startError || completeError || withdrawError || setPlayAmountError) && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          background: "#fee2e2",
          border: "1px solid #ef4444",
          borderRadius: "12px",
          padding: "1rem",
          maxWidth: "400px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
        }}>
          <p style={{ margin: "0 0 0.5rem 0", color: "#991b1b", fontWeight: "600" }}>
            ❌ Transaction Error
          </p>
          <p style={{ margin: 0, color: "#991b1b", fontSize: "0.9rem" }}>
            {startError?.message || completeError?.message || withdrawError?.message || setPlayAmountError?.message}
          </p>
        </div>
      )}

      {/* Success Messages */}
      {(isStartConfirmed || isCompleteConfirmed || isWithdrawConfirmed || isSetPlayAmountConfirmed) && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          background: "#d1fae5",
          border: "1px solid #10b981",
          borderRadius: "12px",
          padding: "1rem",
          maxWidth: "400px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
        }}>
          <p style={{ margin: "0 0 0.5rem 0", color: "#065f46", fontWeight: "600" }}>
            ✅ Transaction Successful
          </p>
          <p style={{ margin: 0, color: "#065f46", fontSize: "0.9rem" }}>
            {isStartConfirmed ? "Quiz started successfully!" :
             isCompleteConfirmed ? "Quiz completed successfully!" :
             isWithdrawConfirmed ? "Funds withdrawn successfully!" :
             isSetPlayAmountConfirmed ? "Play amount updated successfully!" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/contract')({
  component: ContractDebugPage,
}) 