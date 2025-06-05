import { HealthProvider } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  GraduationCap, 
  Star, 
  Calendar, 
  User,
  StarIcon
} from "lucide-react";

interface ProviderCardProps {
  provider: HealthProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const rating = provider.rating / 10; // Convert from stored format
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes("Tomorrow") || availability.includes("Today")) {
      return "text-green-600";
    } else if (availability.includes("This week")) {
      return "text-green-600";
    } else if (availability.includes("Next week")) {
      return "text-orange-500";
    }
    return "text-gray-600";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border border-border">
      <CardContent className="p-6">
        <div className="lg:flex lg:items-start lg:space-x-6">
          <div className="lg:flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {provider.name}
                </h3>
                <p className="text-primary font-medium mb-2">
                  {provider.specialty}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.distance}
                  </span>
                  <span className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {provider.experienceYears}+ years exp.
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {renderStars()}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {rating.toFixed(1)} ({provider.reviewCount} reviews)
                  </span>
                </div>
                <span className={`text-sm font-medium ${getAvailabilityColor(provider.availability)}`}>
                  {provider.availability}
                </span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Insurance Accepted</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.insuranceAccepted.slice(0, 2).map((insurance, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {insurance}
                    </Badge>
                  ))}
                  {provider.insuranceAccepted.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{provider.insuranceAccepted.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Office Location</h4>
                <p className="text-sm text-muted-foreground">
                  {provider.address}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-primary">
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

            {!provider.isAcceptingNewPatients && (
              <div className="mt-3 flex items-center text-sm text-orange-600">
                <User className="h-4 w-4 mr-1" />
                Not accepting new patients
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
