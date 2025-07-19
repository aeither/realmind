import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState, createContext, useContext } from 'react'

// Farcaster SDK imports
import { FrameSDK } from '@farcaster/frame-sdk'

interface FarcasterContextType {
  sdk: FrameSDK | null
  isInFrame: boolean
  user: any | null
}

const FarcasterContext = createContext<FarcasterContextType>({
  sdk: null,
  isInFrame: false,
  user: null,
})

export const useFarcaster = () => {
  const context = useContext(FarcasterContext)
  if (!context) {
    throw new Error('useFarcaster must be used within FarcasterProvider')
  }
  return context
}

function FarcasterLayout() {
  const [sdk, setSdk] = useState<FrameSDK | null>(null)
  const [isInFrame, setIsInFrame] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Initialize Farcaster Frame SDK
        const frameSDK = new FrameSDK()
        
        // Check if we're running inside a Farcaster frame
        const context = await frameSDK.context
        
        if (context) {
          setIsInFrame(true)
          setSdk(frameSDK)
          setUser(context.user)
          
          // Add frame-specific styling
          document.body.classList.add('farcaster-frame')
        }
      } catch (error) {
        console.log('Not running in Farcaster frame:', error)
        setIsInFrame(false)
      }
    }

    initFarcaster()
  }, [])

  const contextValue: FarcasterContextType = {
    sdk,
    isInFrame,
    user,
  }

  return (
    <FarcasterContext.Provider value={contextValue}>
      <div className={`farcaster-container ${isInFrame ? 'in-frame' : 'standalone'}`}>
        {isInFrame && (
          <div className="frame-header bg-purple-600 text-white p-2 text-sm">
            Running in Farcaster • User: {user?.username || 'Anonymous'}
          </div>
        )}
        <Outlet />
      </div>
    </FarcasterContext.Provider>
  )
}

export const Route = createFileRoute('/farcaster/layout')({
  component: FarcasterLayout,
})