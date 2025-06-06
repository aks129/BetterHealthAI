import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProviderCard } from "@/components/provider-card";
import { apiRequest } from "@/lib/queryClient";
import { providerSearchSchema, type ProviderSearch, type HealthProvider } from "@shared/schema";
import { Search, MapPin, Stethoscope, CreditCard } from "lucide-react";

export default function ProviderSearch() {
  const [searchResults, setSearchResults] = useState<HealthProvider[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm<ProviderSearch>({
    resolver: zodResolver(providerSearchSchema),
    defaultValues: {
      specialty: "",
      location: "",
      insurance: "",
      acceptingNewPatients: undefined,
    },
  });

  const { data: allProviders } = useQuery({
    queryKey: ["/api/health-providers"],
  });

  const searchMutation = useMutation({
    mutationFn: async (data: ProviderSearch) => {
      const response = await apiRequest("POST", "/api/health-providers/search", data);
      return response.json();
    },
    onSuccess: (data: HealthProvider[]) => {
      setSearchResults(data);
      setHasSearched(true);
    },
  });

  const onSubmit = (data: ProviderSearch) => {
    // Convert "all" values to empty strings for backend processing
    const searchData = {
      ...data,
      specialty: data.specialty === "all" ? "" : data.specialty,
      insurance: data.insurance === "all" ? "" : data.insurance,
    };
    searchMutation.mutate(searchData);
  };

  const displayProviders = hasSearched ? searchResults : (allProviders || []);

  const specialties = [
    "Primary Care",
    "Internal Medicine", 
    "Dermatology",
    "Cardiology",
    "Orthopedics",
    "Mental Health",
    "Psychiatry",
    "Neurology",
    "Gastroenterology",
    "Endocrinology",
    "Pulmonology",
    "Rheumatology",
    "Oncology",
    "Pediatrics",
    "OB/GYN",
    "Emergency Medicine",
    "Family Medicine",
    "Sports Medicine",
  ];

  const insuranceOptions = [
    "Blue Cross Blue Shield",
    "Aetna", 
    "Cigna",
    "UnitedHealth",
    "Kaiser Permanente",
    "Humana",
    "Anthem",
    "Medicare",
    "Medicaid",
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Find Healthcare Providers</h1>
          <p className="text-lg text-muted-foreground">
            Search for healthcare professionals by specialty, location, insurance, and patient reviews to find the right care for your needs.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-primary" />
              Provider Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Stethoscope className="h-4 w-4 mr-1" />
                          Specialty
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All Specialties" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Specialties</SelectItem>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="City, State or ZIP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Insurance
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All Insurance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Insurance</SelectItem>
                            {insuranceOptions.map((insurance) => (
                              <SelectItem key={insurance} value={insurance}>
                                {insurance}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button 
                      type="submit" 
                      className="w-full btn-primary" 
                      disabled={searchMutation.isPending}
                    >
                      {searchMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="space-y-6">
          {hasSearched && (
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {searchResults.length} provider{searchResults.length !== 1 ? 's' : ''} found
              </h2>
              <Button 
                variant="outline" 
                onClick={() => {
                  setHasSearched(false);
                  setSearchResults([]);
                  form.reset();
                }}
              >
                Clear Search
              </Button>
            </div>
          )}

          {displayProviders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {hasSearched ? "No providers found" : "Ready to search"}
                </h3>
                <p className="text-muted-foreground">
                  {hasSearched 
                    ? "Try adjusting your search criteria to find more providers."
                    : "Use the search form above to find healthcare providers in your area."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            displayProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))
          )}
        </div>

        {/* Provider Search Tips */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Tips for Finding the Right Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Before Your Search</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Check your insurance plan's provider directory</li>
                  <li>• Consider the location and your transportation options</li>
                  <li>• Think about the type of care you need (routine vs. specialized)</li>
                  <li>• Ask for referrals from your current healthcare providers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Questions to Ask</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• What is your experience with my condition?</li>
                  <li>• What are your office hours and availability?</li>
                  <li>• How do you handle urgent care or after-hours questions?</li>
                  <li>• What is your approach to treatment and patient care?</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
