"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building, Coins, LineChart } from "lucide-react"

export default function HeroSection() {
  const router = useRouter()

  return (
    <div className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  OpulRent
                </span>
                <br />
                Blockchain Real Estate
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Revolutionizing real estate with blockchain technology and AI-powered investment analysis. Buy, rent,
                and invest in properties as NFTs.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button onClick={() => router.push("/login")} size="lg">
                Connect Wallet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => router.push("/marketplace")} variant="outline" size="lg">
                Explore Marketplace
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>Tokenized Properties</span>
              </div>
              <div className="flex items-center space-x-1">
                <Coins className="h-4 w-4" />
                <span>Secure Transactions</span>
              </div>
              <div className="flex items-center space-x-1">
                <LineChart className="h-4 w-4" />
                <span>AI Analysis</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 p-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 p-2">
                  <div className="flex flex-col gap-2">
                    <div className="h-32 rounded-lg bg-white/90 dark:bg-gray-900/90 shadow-sm"></div>
                    <div className="h-48 rounded-lg bg-white/90 dark:bg-gray-900/90 shadow-sm"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-48 rounded-lg bg-white/90 dark:bg-gray-900/90 shadow-sm"></div>
                    <div className="h-32 rounded-lg bg-white/90 dark:bg-gray-900/90 shadow-sm"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-lg bg-white/95 dark:bg-gray-900/95 p-4 shadow-lg max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                      <div className="font-semibold">Luxury Apartment #024</div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">2.5 ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">Manhattan, NY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">8.2%</span>
                      </div>
                    </div>
                    <Button className="mt-3 w-full" size="sm">
                      View Property
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
