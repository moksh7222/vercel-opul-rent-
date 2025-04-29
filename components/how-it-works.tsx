import { Building, LineChart, Wallet } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Wallet,
      title: "Connect Wallet",
      description:
        "Connect your crypto wallet to access the OpulRent platform and verify your identity through our KYC process.",
    },
    {
      icon: Building,
      title: "Buy or Rent Properties",
      description:
        "Browse tokenized real estate properties on our marketplace. Purchase property NFTs or rent them directly on the blockchain.",
    },
    {
      icon: LineChart,
      title: "Analyze Investments",
      description:
        "Use our AI-powered investment analysis tool to evaluate properties and make informed investment decisions.",
    },
  ]

  return (
    <section className="py-16 bg-muted/50 rounded-xl">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              OpulRent simplifies real estate investments with blockchain technology
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12 mt-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
