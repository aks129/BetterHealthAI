import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MedicalDisclaimer() {
  return (
    <Alert className="border-l-4 border-l-orange-500 bg-orange-50 border-orange-200 rounded-none">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertDescription className="text-sm">
        <p className="font-medium text-gray-900 mb-1">Important Medical Disclaimer</p>
        <p className="text-gray-700">
          BetterHealth AI provides general health information only. This is not personalized medical advice. 
          Always consult healthcare professionals for diagnosis and treatment. {" "}
          <strong>Call 911 for medical emergencies.</strong>
        </p>
      </AlertDescription>
    </Alert>
  );
}
