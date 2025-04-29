"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import PropertyCard from "@/components/property-card"
import { fetchProperties } from "@/lib/api"
import type { Property } from "@/lib/types"

export default function Marketplace() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties()
        setProperties(data)
      } catch (error) {
        console.error("Failed to load properties:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [])

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const rentProperties = filteredProperties.filter((property) => property.listingType === "rent")

  const buyProperties = filteredProperties.filter((property) => property.listingType === "buy")

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Property Marketplace</h1>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search properties by name or location..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="buy">
        <TabsList className="mb-6">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
        </TabsList>

        <TabsContent value="buy">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading properties...</p>
            </div>
          ) : buyProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyProperties.map((property) => (
                <PropertyCard key={property.id} property={property} actionType="buy" />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">No properties found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rent">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading properties...</p>
            </div>
          ) : rentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} actionType="rent" />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">No properties found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
