"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from "lucide-react"
import { connectWallet } from "@/lib/web3"

interface WalletConnectButtonProps {
  onConnect: (address: string) => void
}

export default function WalletConnectButton({ onConnect }: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const address = await connectWallet()
      if (address) {
        onConnect(address)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} className="w-full" size="lg">
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
