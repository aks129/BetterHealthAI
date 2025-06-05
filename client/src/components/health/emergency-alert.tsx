import { AlertTriangle, Phone, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmergencyAlertProps {
  onClose: () => void;
}

export default function EmergencyAlert({ onClose }: EmergencyAlertProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md">
      <Card className="emergency-alert border-red-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">
                This may be a medical emergency!
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                If you're experiencing severe symptoms, don't wait for AI assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.open("tel:911")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 911 Now
                </Button>
                <Button 
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Nearest ER
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
