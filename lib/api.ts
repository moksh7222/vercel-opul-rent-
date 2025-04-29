// Mock API functions to simulate backend interactions
import type { Property, RentalAgreement } from "./types"

// Mock data for properties
const mockProperties: Property[] = [
  {
    id: "prop-1",
    name: "Luxury Apartment",
    location: "Manhattan, New York",
    price: 2.5,
    rentalPrice: 3500,
    description: "Beautiful luxury apartment in the heart of Manhattan",
    bedrooms: 2,
    bathrooms: 2,
    size: 1200,
    imageUrl: "/placeholder.svg?height=200&width=400&text=Luxury+Apartment",
    listingType: "buy",
    owner: "0x123...",
    tokenId: "1",
  },
  {
    id: "prop-2",
    name: "Beachfront Villa",
    location: "Miami, Florida",
    price: 5.8,
    rentalPrice: 6000,
    description: "Stunning beachfront villa with ocean views",
    bedrooms: 4,
    bathrooms: 3.5,
    size: 3200,
    imageUrl: "/placeholder.svg?height=200&width=400&text=Beachfront+Villa",
    listingType: "buy",
    owner: "0x456...",
    tokenId: "2",
  },
  {
    id: "prop-3",
    name: "Downtown Loft",
    location: "San Francisco, California",
    price: 1.8,
    rentalPrice: 2800,
    description: "Modern loft in downtown San Francisco",
    bedrooms: 1,
    bathrooms: 1,
    size: 950,
    imageUrl: "/placeholder.svg?height=200&width=400&text=Downtown+Loft",
    listingType: "rent",
    owner: "0x789...",
    tokenId: "3",
  },
  {
    id: "prop-4",
    name: "Mountain Cabin",
    location: "Aspen, Colorado",
    price: 3.2,
    rentalPrice: 4200,
    description: "Cozy mountain cabin with stunning views",
    bedrooms: 3,
    bathrooms: 2,
    size: 1800,
    imageUrl: "/placeholder.svg?height=200&width=400&text=Mountain+Cabin",
    listingType: "rent",
    owner: "0xabc...",
    tokenId: "4",
  },
  {
    id: "prop-5",
    name: "Suburban Home",
    location: "Austin, Texas",
    price: 1.5,
    rentalPrice: 2200,
    description: "Spacious family home in a quiet suburb",
    bedrooms: 4,
    bathrooms: 2.5,
    size: 2400,
    imageUrl: "/placeholder.svg?height=200&width=400&text=Suburban+Home",
    listingType: "buy",
    owner: "0xdef...",
    tokenId: "5",
  },
  {
    id: "prop-6",
    name: "City Penthouse",
    location: "Chicago, Illinois",
    price: 4.2,
    rentalPrice: 5500,
    description: "Luxurious penthouse with city skyline views",
    bedrooms: 3,
    bathrooms: 3,
    size: 2800,
    imageUrl: "/placeholder.svg?height=200&width=400&text=City+Penthouse",
    listingType: "rent",
    owner: "0xghi...",
    tokenId: "6",
  },
]

// Mock data for rental agreements
const mockRentalAgreements: RentalAgreement[] = [
  {
    id: "rent-1",
    propertyId: "prop-3",
    propertyName: "Downtown Loft",
    propertyLocation: "San Francisco, California",
    tenantId: "user-1",
    tenantName: "John Doe",
    tenantWallet: "0x123...",
    startDate: "2025-01-01",
    expiryDate: "2025-12-31",
    monthlyRent: 2800,
    securityDeposit: 5600,
    status: "active",
  },
  {
    id: "rent-2",
    propertyId: "prop-4",
    propertyName: "Mountain Cabin",
    propertyLocation: "Aspen, Colorado",
    tenantId: "user-2",
    tenantName: "Jane Smith",
    tenantWallet: "0x456...",
    startDate: "2025-02-15",
    expiryDate: "2025-08-14",
    monthlyRent: 4200,
    securityDeposit: 8400,
    status: "active",
  },
]

// Fetch properties from the API
export async function fetchProperties(): Promise<Property[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockProperties
}

// Fetch dashboard data from the API
export async function fetchDashboardData() {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return mock dashboard data
  return {
    kycStatus: "Approved",
    properties: mockProperties.slice(0, 2), // First two properties as owned
    rentalAgreements: mockRentalAgreements,
    rentalIncome: 9800, // Sum of monthly rents
  }
}

// Mint a new property
export async function mintProperty(propertyData: any): Promise<Property> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Create a new property with the provided data
  const newProperty: Property = {
    id: `prop-${mockProperties.length + 1}`,
    name: propertyData.name,
    location: propertyData.location,
    price: Number.parseFloat(propertyData.price),
    description: propertyData.description,
    bedrooms: propertyData.bedrooms ? Number.parseInt(propertyData.bedrooms) : undefined,
    bathrooms: propertyData.bathrooms ? Number.parseFloat(propertyData.bathrooms) : undefined,
    size: propertyData.size ? Number.parseInt(propertyData.size) : undefined,
    imageUrl: `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(propertyData.name)}`,
    listingType: propertyData.listingType as "buy" | "rent",
    owner: "0x123...", // Current user's address
    tokenId: (mockProperties.length + 1).toString(),
  }

  // In a real app, this would call your backend API to mint the NFT
  return newProperty
}

// Analyze investment
export async function analyzeInvestment(propertyData: any) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2500))

  // Parse property price
  const price = Number.parseFloat(propertyData.price)

  // Calculate mock analysis results
  const monthlyRent = Math.round(price * 1000 * 0.007) // 0.7% of property value
  const annualRoi = Number.parseFloat((((monthlyRent * 12) / (price * 1000)) * 100).toFixed(2))
  const areaGrowthScore = Math.floor(Math.random() * 4) + 6 // Random score between 6-9

  // Generate predicted value growth for 5 years
  const predictedValueGrowth = Array(5)
    .fill(0)
    .map((_, index) => {
      const yearlyGrowth = price * 1000 * (1 + (0.03 + areaGrowthScore * 0.005) * (index + 1))
      return Math.round(yearlyGrowth)
    })

  // Generate comparable properties
  const comparableProperties = [
    {
      name: "Similar Property A",
      price: Math.round(price * 1000 * 0.9),
      roi: Number.parseFloat((annualRoi * 0.9).toFixed(2)),
    },
    {
      name: "Similar Property B",
      price: Math.round(price * 1000 * 1.1),
      roi: Number.parseFloat((annualRoi * 1.05).toFixed(2)),
    },
    {
      name: "Similar Property C",
      price: Math.round(price * 1000 * 1.05),
      roi: Number.parseFloat((annualRoi * 0.95).toFixed(2)),
    },
  ]

  return {
    monthlyRent,
    annualRoi,
    areaGrowthScore,
    predictedValueGrowth,
    comparableProperties,
  }
}
