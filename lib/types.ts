export interface Property {
  id: string
  name: string
  location: string
  price: number
  rentalPrice?: number
  description?: string
  bedrooms?: number
  bathrooms?: number
  size?: number
  imageUrl?: string
  listingType: "buy" | "rent"
  owner?: string
  tokenId?: string
}

export interface RentalAgreement {
  id: string
  propertyId: string
  propertyName: string
  propertyLocation: string
  tenantId: string
  tenantName: string
  tenantWallet: string
  startDate: string
  expiryDate: string
  monthlyRent: number
  securityDeposit: number
  status: "active" | "expired" | "terminated"
}

export interface User {
  id: string
  walletAddress: string
  fullName: string
  email: string
  kycStatus: "pending" | "approved" | "rejected"
  kycSubmissionDate: string
}
