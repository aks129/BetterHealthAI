import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmergencyAlert } from "@/components/emergency-alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { healthInquirySearchSchema, type HealthInquirySearch, type HealthInquiry } from "@shared/schema";
import { EMERGENCY_KEYWORDS } from "@/lib/types";
import { AlertCircle, Send, Clock, Activity } from "lucide-react";

export default function HealthInquiry() {
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState<HealthInquiry | null>(null);

  const form = useForm<HealthInquirySearch>({
    resolver: zodResolver(healthInquirySearchSchema),
    defaultValues: {
      concern: "",
      severity: undefined,
      timePattern: "",
      associatedSymptoms: [],
    },
  });

  const { data: inquiries } = useQuery({
    queryKey: ["/api/health-inquiries"],
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (data: HealthInquirySearch) => {
      const response = await apiRequest("POST", "/api/health-inquiries", data);
      return response.json();
    },
    onSuccess: (data: HealthInquiry) => {
      setCurrentInquiry(data);
      queryClient.invalidateQueries({ queryKey: ["/api/health-inquiries"] });
      
      if (data.isEmergency) {
        setShowEmergencyAlert(true);
      }
    },
  });

  const onSubmit = (data: HealthInquirySearch) => {
    // Check for emergency keywords
    const concernLower = data.concern.toLowerCase();
    const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(({ keyword }) => 
      concernLower.includes(keyword)
    );

    if (hasEmergencyKeyword) {
      setShowEmergencyAlert(true);
    }

    createInquiryMutation.mutate(data);
  };

  const watchConcern = form.watch("concern");

  // Check for emergency keywords in real-time
  useState(() => {
    if (watchConcern) {
      const concernLower = watchConcern.toLowerCase();
      const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(({ keyword }) => 
        concernLower.includes(keyword)
      );
      
      if (hasEmergencyKeyword && !showEmergencyAlert) {
        setShowEmergencyAlert(true);
      }
    }
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <EmergencyAlert 
        isVisible={showEmergencyAlert} 
        onClose={() => setShowEmergencyAlert(false)} 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Health Inquiry Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Describe your health concern and get evidence-based guidance. Remember, this is for informational purposes only and doesn't replace professional medical advice.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inquiry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                Describe Your Health Concern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="concern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What health concern would you like guidance on?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your symptoms, when they started, and any relevant details..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity (1-10 scale)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              placeholder="Rate your concern"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timePattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Pattern</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="When do symptoms occur?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                              <SelectItem value="night">Night</SelectItem>
                              <SelectItem value="constant">Constant</SelectItem>
                              <SelectItem value="intermittent">Intermittent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={createInquiryMutation.isPending}
                  >
                    {createInquiryMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Get Health Guidance
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Response Display */}
          <div className="space-y-6">
            {currentInquiry && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {currentInquiry.isEmergency ? (
                      <>
                        <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                        Emergency Guidance
                      </>
                    ) : (
                      <>
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        Health Guidance Response
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-sm text-foreground">
                      {currentInquiry.response}
                    </div>
                  </div>
                  
                  {currentInquiry.isEmergency && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="font-semibold text-red-800">Emergency Detected</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        This appears to be a medical emergency. Please seek immediate professional care.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Inquiries */}
            {inquiries && inquiries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Recent Inquiries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inquiries.slice(0, 3).map((inquiry: HealthInquiry) => (
                      <div
                        key={inquiry.id}
                        className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setCurrentInquiry(inquiry)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {inquiry.concern.slice(0, 60)}...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {inquiry.isEmergency && (
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
