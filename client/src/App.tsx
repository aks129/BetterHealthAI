import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import Home from "@/pages/home";
import HealthInquiry from "@/pages/health-inquiry";
import ProviderSearch from "@/pages/provider-search";
import HealthData from "@/pages/health-data";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/health-inquiry" component={HealthInquiry} />
      <Route path="/provider-search" component={ProviderSearch} />
      <Route path="/health-data" component={HealthData} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <MedicalDisclaimer />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
