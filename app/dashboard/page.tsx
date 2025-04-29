"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchDashboardData } from "@/lib/api"
import type { Property, RentalAgreement } from "@/lib/types"
import PropertyCard from "@/components/property-card"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    kycStatus: string
    properties: Property[]
    rentalAgreements: RentalAgreement[]
    rentalIncome: number
  } | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={dashboardData?.kycStatus === "Approved" ? "success" : "secondary"}>
              {dashboardData?.kycStatus || "Pending"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Properties Owned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData?.properties.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Rental Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${dashboardData?.rentalIncome.toFixed(2) || "0.00"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties">
        <TabsList className="mb-6">
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="rentals">Rental Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {dashboardData?.properties && dashboardData.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.properties.map((property) => (
                <PropertyCard key={property.id} property={property} showActions={false} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  You don't own any properties yet. Visit the marketplace to buy or mint your own property.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rentals">
          {dashboardData?.rentalAgreements && dashboardData.rentalAgreements.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.rentalAgreements.map((agreement) => (
                <Card key={agreement.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="font-semibold">{agreement.propertyName}</h3>
                        <p className="text-sm text-muted-foreground">{agreement.propertyLocation}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <p className="text-sm">
                          <span className="font-medium">Tenant:</span> {agreement.tenantName}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Monthly Rent:</span> ${agreement.monthlyRent}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Expires:</span> {agreement.expiryDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">You don't have any active rental agreements.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
