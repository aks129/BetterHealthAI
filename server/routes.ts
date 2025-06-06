import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  healthInquirySearchSchema, 
  providerSearchSchema,
  insertHealthInquirySchema,
  insertHealthDocumentSchema
} from "@shared/schema";
import { getGoogleMapsConfig, geocodeAddress, calculateDistance } from "./google-maps";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureUploadDir();

  // Health Inquiries
  app.get("/api/health-inquiries", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const inquiries = await storage.getHealthInquiries(userId);
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health inquiries" });
    }
  });

  app.post("/api/health-inquiries", async (req, res) => {
    try {
      const validatedData = healthInquirySearchSchema.parse(req.body);
      
      // Check for emergency keywords
      const emergencyKeywords = [
        'chest pain', 'heart attack', 'stroke', 'severe bleeding', 
        'unconscious', 'trouble breathing', 'severe allergic reaction',
        'poisoning', 'severe burns', 'severe trauma'
      ];
      
      const concernLower = validatedData.concern.toLowerCase();
      const isEmergency = emergencyKeywords.some(keyword => 
        concernLower.includes(keyword)
      );

      let response = "";
      
      if (isEmergency) {
        response = `**MEDICAL EMERGENCY DETECTED**

If you are experiencing a medical emergency, please:
- Call 911 immediately
- Go to the nearest emergency room
- Do not delay seeking professional medical care

This appears to be a serious medical condition that requires immediate professional attention. Please seek emergency care right away.

**Important:** This AI system cannot provide emergency medical care. Always prioritize getting professional medical help for urgent symptoms.`;
      } else {
        // Generate structured response based on concern
        response = generateHealthResponse(validatedData);
      }

      const inquiryData = {
        concern: validatedData.concern,
        symptoms: validatedData.associatedSymptoms || [],
        severity: validatedData.severity,
        timePattern: validatedData.timePattern,
        associatedSymptoms: validatedData.associatedSymptoms || [],
        response,
        isEmergency,
        userId: null, // In a real app, this would come from auth
      };

      const inquiry = await storage.createHealthInquiry(inquiryData);
      res.json(inquiry);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create health inquiry" });
      }
    }
  });

  // Health Providers
  app.get("/api/health-providers", async (req, res) => {
    try {
      const providers = await storage.getHealthProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health providers" });
    }
  });

  app.post("/api/health-providers/search", async (req, res) => {
    try {
      const searchParams = providerSearchSchema.parse(req.body);
      const providers = await storage.searchHealthProviders(searchParams);
      res.json(providers);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to search health providers" });
      }
    }
  });

  app.get("/api/health-providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getHealthProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  // Health Documents
  app.get("/api/health-documents", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const documents = await storage.getHealthDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health documents" });
    }
  });

  app.post("/api/health-documents", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { category, description } = req.body;
      
      const documentData = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category: category || 'other',
        description: description || '',
        filePath: req.file.path,
        userId: null, // In a real app, this would come from auth
      };

      const document = await storage.createHealthDocument(documentData);
      res.json(document);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  });

  app.delete("/api/health-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getHealthDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete the physical file
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.warn("Failed to delete file:", error);
      }

      const deleted = await storage.deleteHealthDocument(id);
      
      if (deleted) {
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete document" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Serve uploaded files
  app.get("/api/health-documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getHealthDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.download(document.filePath, document.fileName);
    } catch (error) {
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateHealthResponse(inquiry: any): string {
  const { concern, severity, timePattern, associatedSymptoms } = inquiry;
  
  return `**Understanding Your Concern:**
Thank you for sharing your health concern: "${concern}". I'll provide you with evidence-based information to help guide your next steps.

**Evidence-Based Information:**
Based on the symptoms you've described${severity ? ` with a severity level of ${severity}/10` : ''}, this type of concern can have various causes. ${timePattern ? `The timing pattern you mentioned (${timePattern}) provides important context.` : ''} ${associatedSymptoms?.length ? `The additional symptoms you noted (${associatedSymptoms.join(', ')}) help provide a more complete picture.` : ''}

**Recommended Actions:**
1. **Monitor your symptoms** - Keep track of any changes in severity, frequency, or new symptoms
2. **Maintain a symptom diary** - Note triggers, timing, and what helps or worsens the condition
3. **Practice self-care** - Ensure adequate rest, hydration, and stress management

**When to Seek Professional Care:**
You should consult with a healthcare provider if:
- Symptoms persist or worsen over the next few days
- You develop new or concerning symptoms
- The condition interferes with your daily activities
- You feel uncertain about the severity

${severity && severity >= 7 ? "**Given the severity level you indicated, consider scheduling an appointment with a healthcare provider within the next 1-2 days.**" : ""}

**Important Note:**
This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for personalized medical guidance. If you're experiencing a medical emergency, call 911 immediately.

Would you like help finding healthcare providers in your area who can provide a proper evaluation?`;
}
