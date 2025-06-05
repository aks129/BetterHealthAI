import { useEffect, useState } from "react";
import { AlertTriangle, X, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EmergencyAlertProps {
  isVisible: boolean;
  onClose: () => void;
}

export function EmergencyAlert({ isVisible, onClose }: EmergencyAlertProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    }
  }, [isVisible]);

  if (!mounted || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-md">
      <Alert className="border-destructive bg-destructive/10 border-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertDescription>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold text-destructive mb-2">
                This may be a medical emergency!
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Call 911 immediately if you need urgent care.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => window.open("tel:911", "_self")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 911 Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // In a real app, this would find nearest ER
                    window.open("https://www.google.com/maps/search/emergency+room+near+me", "_blank");
                  }}
                >
                  Find Nearest ER
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
