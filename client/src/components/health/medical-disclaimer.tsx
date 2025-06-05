import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MedicalDisclaimer() {
  return (
    <Alert className="bg-warning/10 border-l-4 border-warning border-y-0 border-r-0 rounded-none">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="text-sm">
        <span className="font-medium text-gray-900 block mb-1">
          Important Medical Disclaimer
        </span>
        <span className="text-gray-700">
          BetterHealth AI provides general health information only. This is not personalized medical advice. 
          Always consult healthcare professionals for diagnosis and treatment. {" "}
          <strong>Call 911 for medical emergencies.</strong>
        </span>
      </AlertDescription>
    </Alert>
  );
}
