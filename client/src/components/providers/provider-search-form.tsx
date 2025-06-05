import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { ProviderSearchParams } from "@shared/schema";

interface ProviderSearchFormProps {
  onSearch: (params: ProviderSearchParams) => void;
  isLoading?: boolean;
}

export default function ProviderSearchForm({ onSearch, isLoading }: ProviderSearchFormProps) {
  const [searchParams, setSearchParams] = useState<ProviderSearchParams>({
    specialty: "",
    location: "",
    insurance: "",
  });

  const specialties = [
    "Primary Care",
    "Internal Medicine", 
    "Dermatology",
    "Cardiology",
    "Orthopedics",
    "Mental Health",
    "Gynecology",
    "Pediatrics",
    "Neurology",
    "Gastroenterology",
  ];

  const insuranceOptions = [
    "Blue Cross Blue Shield",
    "Aetna",
    "Cigna", 
    "UnitedHealth",
    "Kaiser Permanente",
    "Anthem",
    "Humana",
    "Medicare",
    "Medicaid",
  ];

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="shadow-material-lg">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Select 
              value={searchParams.specialty} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, specialty: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, State or ZIP"
              value={searchParams.location}
              onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance</Label>
            <Select 
              value={searchParams.insurance} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, insurance: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Insurance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Insurance</SelectItem>
                {insuranceOptions.map((insurance) => (
                  <SelectItem key={insurance} value={insurance}>
                    {insurance}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-700"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
