"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload } from "lucide-react"

interface KYCFormProps {
  walletAddress: string
  onSubmit: (formData: any) => void
}

export default function KYCForm({ walletAddress, onSubmit }: KYCFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    idDocument: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, idDocument: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you would upload the file to your backend
      // For this demo, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSubmit({
        ...formData,
        walletAddress,
      })
    } catch (error) {
      console.error("Error submitting KYC:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="John Doe"
          required
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="idDocument">Government ID</Label>
        <div className="flex items-center gap-2">
          <Input
            id="idDocument"
            name="idDocument"
            type="file"
            accept="image/*,.pdf"
            required
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("idDocument")?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {formData.idDocument ? formData.idDocument.name : "Upload ID Document"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Please upload a valid government-issued ID (passport, driver's license, etc.)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Connected Wallet</Label>
        <div className="p-2 bg-muted rounded-md text-sm font-mono break-all">{walletAddress}</div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit KYC"
        )}
      </Button>
    </form>
  )
}
