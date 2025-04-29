"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { mintProperty } from "@/lib/api"

export default function MintProperty() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    description: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    listingType: "buy",
    ipfsHash: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.name || !formData.location || !formData.price || !formData.ipfsHash) {
        throw new Error("Please fill in all required fields")
      }

      // Call API to mint property
      await mintProperty(formData)

      toast({
        title: "Property Minted Successfully",
        description: "Your property has been minted as an NFT and listed on the marketplace.",
      })

      // Redirect to marketplace
      setTimeout(() => {
        router.push("/marketplace")
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mint property",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mint Property NFT</CardTitle>
            <CardDescription>Create a new property NFT to list on the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sq ft)</Label>
                  <Input id="size" name="size" type="number" min="0" value={formData.size} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listingType">Listing Type</Label>
                  <Select
                    value={formData.listingType}
                    onValueChange={(value) => handleSelectChange("listingType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipfsHash">IPFS Hash (for property images) *</Label>
                <Input id="ipfsHash" name="ipfsHash" value={formData.ipfsHash} onChange={handleChange} required />
                <p className="text-xs text-muted-foreground">
                  Upload your property images to IPFS and paste the hash here
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Minting..." : "Mint Property NFT"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
