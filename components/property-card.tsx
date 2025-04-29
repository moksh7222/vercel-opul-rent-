import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Property } from "@/lib/types"
import { Bed, Bath, Square, MapPin } from "lucide-react"

interface PropertyCardProps {
  property: Property
  showActions?: boolean
  actionType?: "buy" | "rent" | "analyze"
}

export default function PropertyCard({ property, showActions = true, actionType = "buy" }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={property.imageUrl || "/placeholder.svg?height=200&width=400"}
          alt={property.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={property.listingType === "rent" ? "secondary" : "default"}>
            {property.listingType === "rent" ? "For Rent" : "For Sale"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg truncate">{property.name}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">
            {property.listingType === "rent" ? `$${property.rentalPrice}/mo` : `${property.price} ETH`}
          </div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          {property.size && (
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.size} sqft</span>
            </div>
          )}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          {actionType === "buy" && <Button className="w-full">Buy Now</Button>}
          {actionType === "rent" && <Button className="w-full">Rent Now</Button>}
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/analyze?propertyId=${property.id}`}>Analyze</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
