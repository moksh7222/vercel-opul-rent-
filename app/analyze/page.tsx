"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { analyzeInvestment } from "@/lib/api"
import InvestmentChart from "@/components/investment-chart"

type AnalysisResult = {
  monthlyRent: number
  annualRoi: number
  areaGrowthScore: number
  predictedValueGrowth: number[]
  comparableProperties: {
    name: string
    price: number
    roi: number
  }[]
}

export default function AnalyzePage() {
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [formData, setFormData] = useState({
    location: "",
    size: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
    yearBuilt: "",
    additionalInfo: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)

    try {
      // Validate form
      if (!formData.location || !formData.size || !formData.price) {
        throw new Error("Please fill in all required fields")
      }

      // Call API to analyze investment
      const result = await analyzeInvestment(formData)
      setAnalysisResult(result)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze investment",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Investment Analysis Bot</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Enter property details to get an AI-powered investment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 123 Main St, New York, NY"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sq ft) *</Label>
                  <Input
                    id="size"
                    name="size"
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Input
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    placeholder="e.g., Apartment, House"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.yearBuilt}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Any additional details about the property..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze Investment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {analysisResult ? (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>AI-powered investment analysis for your property</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="comparables">Comparables</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Monthly Rent</p>
                            <p className="text-2xl font-bold">${analysisResult.monthlyRent}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Annual ROI</p>
                            <p className="text-2xl font-bold">{analysisResult.annualRoi}%</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Area Growth</p>
                            <p className="text-2xl font-bold">{analysisResult.areaGrowthScore}/10</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">Investment Summary</h3>
                        <p className="text-sm">
                          Based on our AI analysis, this property has an estimated monthly rental income of $
                          {analysisResult.monthlyRent}, providing an annual ROI of {analysisResult.annualRoi}%. The area
                          has a growth score of {analysisResult.areaGrowthScore}/10, indicating{" "}
                          {analysisResult.areaGrowthScore > 7
                            ? "strong"
                            : analysisResult.areaGrowthScore > 4
                              ? "moderate"
                              : "limited"}{" "}
                          potential for property value appreciation.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="charts">
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Predicted Value Growth (5 Years)</h3>
                        <div className="h-64">
                          <InvestmentChart data={analysisResult.predictedValueGrowth} chartType="line" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Investment Metrics</h3>
                        <div className="h-64">
                          <InvestmentChart
                            data={[
                              analysisResult.monthlyRent * 12,
                              (analysisResult.annualRoi / 100) * Number.parseFloat(formData.price),
                              analysisResult.areaGrowthScore * 1000,
                            ]}
                            chartType="bar"
                            labels={["Annual Rent", "Annual Return", "Growth Potential"]}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="comparables">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Comparable Properties</h3>
                    {analysisResult.comparableProperties.map((property, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{property.name}</h4>
                              <p className="text-sm text-muted-foreground">Price: ${property.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">ROI: {property.roi}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
              <h3 className="text-xl font-semibold mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground mb-4">
                Fill out the property details form and click "Analyze Investment" to get started.
              </p>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M2 22v-5l5-5 5 5-5 5z" />
                  <path d="M9.5 14.5 16 8" />
                  <path d="M17 2v5h5" />
                  <path d="M22 2 9 15" />
                </svg>
              </div>
              <p className="text-sm">
                Our AI will analyze the property and provide insights on rental income, ROI, and growth potential.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
