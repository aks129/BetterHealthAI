import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, GraduationCap, Calendar, Star, Phone } from "lucide-react";
import { generateStars } from "@/lib/utils";
import type { HealthProvider } from "@shared/schema";

interface ProviderCardProps {
  provider: HealthProvider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const stars = generateStars(provider.rating || 0);

  const getAvailabilityColor = (availability: string) => {
    if (availability.toLowerCase().includes("tomorrow") || availability.toLowerCase().includes("today")) {
      return "text-green-600";
    }
    if (availability.toLowerCase().includes("week")) {
      return "text-yellow-600";
    }
    return "text-gray-600";
  };

  return (
    <Card className="provider-card shadow-material hover:shadow-material-lg border border-gray-100">
      <CardContent className="p-6">
        <div className="lg:flex lg:items-start lg:space-x-6">
          <div className="lg:flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {provider.name}
                </h3>
                <p className="text-primary font-medium mb-2">
                  {provider.specialty}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.location}
                  </span>
                  {provider.experience && (
                    <span className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {provider.experience} exp.
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    {stars.map((star, index) => (
                      <i key={index} className={star} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {provider.rating} ({provider.reviewCount} reviews)
                  </span>
                </div>
                {provider.availability && (
                  <span className={`text-sm font-medium ${getAvailabilityColor(provider.availability)}`}>
                    {provider.availability}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Insurance Accepted</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.insuranceAccepted?.slice(0, 3).map((insurance) => (
                    <Badge key={insurance} variant="secondary" className="text-xs">
                      {insurance}
                    </Badge>
                  ))}
                  {provider.insuranceAccepted && provider.insuranceAccepted.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{provider.insuranceAccepted.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Office Location</h4>
                <p className="text-sm text-gray-600">
                  {provider.address}
                </p>
                {provider.phone && (
                  <p className="text-sm text-gray-600 mt-1">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {provider.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-primary text-white hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
              <Button variant="outline">
                View Full Profile
              </Button>
              <Button variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Read Reviews
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
