"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import WalletConnectButton from "@/components/wallet-connect-button"
import KYCForm from "@/components/kyc-form"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleWalletConnect = (address: string) => {
    setWalletConnected(true)
    setWalletAddress(address)
    toast({
      title: "Wallet Connected",
      description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    })
  }

  const handleKYCSubmit = async (formData: any) => {
    // In a real app, this would call your backend API
    console.log("KYC Data:", formData)

    // Simulate API call
    toast({
      title: "KYC Submitted",
      description: "Your KYC information has been submitted for review.",
    })

    // Redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login to OpulRent</CardTitle>
            <CardDescription>Connect your wallet and complete KYC to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {!walletConnected ? (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-center mb-4">Connect your wallet to get started</p>
                <WalletConnectButton onConnect={handleWalletConnect} />
              </div>
            ) : (
              <KYCForm walletAddress={walletAddress} onSubmit={handleKYCSubmit} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
