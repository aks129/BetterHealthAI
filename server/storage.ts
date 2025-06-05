import { 
  users, 
  healthProviders, 
  healthInquiries, 
  healthDocuments,
  type User, 
  type InsertUser,
  type HealthProvider,
  type InsertHealthProvider,
  type HealthInquiry,
  type InsertHealthInquiry,
  type HealthDocument,
  type InsertHealthDocument,
  type ProviderSearch
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Health Provider methods
  getHealthProviders(): Promise<HealthProvider[]>;
  searchHealthProviders(search: ProviderSearch): Promise<HealthProvider[]>;
  getHealthProvider(id: number): Promise<HealthProvider | undefined>;
  createHealthProvider(provider: InsertHealthProvider): Promise<HealthProvider>;

  // Health Inquiry methods
  getHealthInquiries(userId?: number): Promise<HealthInquiry[]>;
  getHealthInquiry(id: number): Promise<HealthInquiry | undefined>;
  createHealthInquiry(inquiry: InsertHealthInquiry): Promise<HealthInquiry>;
  updateHealthInquiry(id: number, updates: Partial<HealthInquiry>): Promise<HealthInquiry | undefined>;

  // Health Document methods
  getHealthDocuments(userId?: number): Promise<HealthDocument[]>;
  getHealthDocument(id: number): Promise<HealthDocument | undefined>;
  createHealthDocument(document: InsertHealthDocument): Promise<HealthDocument>;
  deleteHealthDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthProviders: Map<number, HealthProvider>;
  private healthInquiries: Map<number, HealthInquiry>;
  private healthDocuments: Map<number, HealthDocument>;
  private currentUserId: number;
  private currentProviderId: number;
  private currentInquiryId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.healthProviders = new Map();
    this.healthInquiries = new Map();
    this.healthDocuments = new Map();
    this.currentUserId = 1;
    this.currentProviderId = 1;
    this.currentInquiryId = 1;
    this.currentDocumentId = 1;

    // Seed with sample providers
    this.seedHealthProviders();
  }

  private seedHealthProviders() {
    const sampleProviders: InsertHealthProvider[] = [
      {
        name: "Dr. Sarah Chen, MD",
        specialty: "Internal Medicine • Primary Care",
        location: "San Francisco, CA",
        address: "123 Medical Center Drive, San Francisco, CA 94102",
        phone: "(415) 555-0123",
        rating: 49, // 4.9 * 10
        reviewCount: 127,
        insuranceAccepted: ["Blue Cross Blue Shield", "Aetna", "Cigna", "UnitedHealth", "Kaiser"],
        availability: "Next available: Tomorrow",
        experienceYears: 15,
        distance: "2.3 miles away",
        isAcceptingNewPatients: true,
      },
      {
        name: "Dr. Michael Rodriguez, MD",
        specialty: "Dermatology • Skin Cancer Specialist",
        location: "San Francisco, CA",
        address: "456 Dermatology Plaza, San Francisco, CA 94103",
        phone: "(415) 555-0456",
        rating: 47, // 4.7 * 10
        reviewCount: 89,
        insuranceAccepted: ["Cigna", "UnitedHealth", "Blue Cross Blue Shield"],
        availability: "Next available: Next week",
        experienceYears: 12,
        distance: "1.8 miles away",
        isAcceptingNewPatients: true,
      },
      {
        name: "Dr. Emily Johnson, MD",
        specialty: "Cardiology • Heart Disease Specialist",
        location: "San Francisco, CA",
        address: "789 Heart Health Center, San Francisco, CA 94104",
        phone: "(415) 555-0789",
        rating: 48, // 4.8 * 10
        reviewCount: 156,
        insuranceAccepted: ["Blue Cross Blue Shield", "Aetna", "UnitedHealth"],
        availability: "Next available: This week",
        experienceYears: 18,
        distance: "3.1 miles away",
        isAcceptingNewPatients: true,
      },
      {
        name: "Dr. James Wilson, MD",
        specialty: "Orthopedics • Sports Medicine",
        location: "San Francisco, CA",
        address: "321 Sports Medicine Clinic, San Francisco, CA 94105",
        phone: "(415) 555-0321",
        rating: 46, // 4.6 * 10
        reviewCount: 93,
        insuranceAccepted: ["Aetna", "Cigna", "Kaiser"],
        availability: "Next available: Today",
        experienceYears: 14,
        distance: "4.2 miles away",
        isAcceptingNewPatients: true,
      },
      {
        name: "Dr. Lisa Park, MD",
        specialty: "Mental Health • Psychiatry",
        location: "San Francisco, CA",
        address: "654 Mental Health Center, San Francisco, CA 94106",
        phone: "(415) 555-0654",
        rating: 50, // 5.0 * 10
        reviewCount: 74,
        insuranceAccepted: ["Blue Cross Blue Shield", "UnitedHealth", "Cigna"],
        availability: "Next available: Next week",
        experienceYears: 10,
        distance: "2.7 miles away",
        isAcceptingNewPatients: false,
      },
    ];

    sampleProviders.forEach(provider => {
      this.createHealthProvider(provider);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Health Provider methods
  async getHealthProviders(): Promise<HealthProvider[]> {
    return Array.from(this.healthProviders.values());
  }

  async searchHealthProviders(search: ProviderSearch): Promise<HealthProvider[]> {
    let providers = Array.from(this.healthProviders.values());

    if (search.specialty) {
      providers = providers.filter(p => 
        p.specialty.toLowerCase().includes(search.specialty!.toLowerCase())
      );
    }

    if (search.location) {
      providers = providers.filter(p => 
        p.location.toLowerCase().includes(search.location!.toLowerCase())
      );
    }

    if (search.insurance) {
      providers = providers.filter(p => 
        p.insuranceAccepted.some(ins => 
          ins.toLowerCase().includes(search.insurance!.toLowerCase())
        )
      );
    }

    if (search.acceptingNewPatients !== undefined) {
      providers = providers.filter(p => p.isAcceptingNewPatients === search.acceptingNewPatients);
    }

    return providers;
  }

  async getHealthProvider(id: number): Promise<HealthProvider | undefined> {
    return this.healthProviders.get(id);
  }

  async createHealthProvider(insertProvider: InsertHealthProvider): Promise<HealthProvider> {
    const id = this.currentProviderId++;
    const provider: HealthProvider = { ...insertProvider, id };
    this.healthProviders.set(id, provider);
    return provider;
  }

  // Health Inquiry methods
  async getHealthInquiries(userId?: number): Promise<HealthInquiry[]> {
    const inquiries = Array.from(this.healthInquiries.values());
    if (userId) {
      return inquiries.filter(inquiry => inquiry.userId === userId);
    }
    return inquiries;
  }

  async getHealthInquiry(id: number): Promise<HealthInquiry | undefined> {
    return this.healthInquiries.get(id);
  }

  async createHealthInquiry(insertInquiry: InsertHealthInquiry): Promise<HealthInquiry> {
    const id = this.currentInquiryId++;
    const inquiry: HealthInquiry = { 
      ...insertInquiry, 
      id,
      createdAt: new Date()
    };
    this.healthInquiries.set(id, inquiry);
    return inquiry;
  }

  async updateHealthInquiry(id: number, updates: Partial<HealthInquiry>): Promise<HealthInquiry | undefined> {
    const inquiry = this.healthInquiries.get(id);
    if (!inquiry) return undefined;
    
    const updatedInquiry = { ...inquiry, ...updates };
    this.healthInquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }

  // Health Document methods
  async getHealthDocuments(userId?: number): Promise<HealthDocument[]> {
    const documents = Array.from(this.healthDocuments.values());
    if (userId) {
      return documents.filter(doc => doc.userId === userId);
    }
    return documents;
  }

  async getHealthDocument(id: number): Promise<HealthDocument | undefined> {
    return this.healthDocuments.get(id);
  }

  async createHealthDocument(insertDocument: InsertHealthDocument): Promise<HealthDocument> {
    const id = this.currentDocumentId++;
    const document: HealthDocument = { 
      ...insertDocument, 
      id,
      uploadDate: new Date()
    };
    this.healthDocuments.set(id, document);
    return document;
  }

  async deleteHealthDocument(id: number): Promise<boolean> {
    return this.healthDocuments.delete(id);
  }
}

export const storage = new MemStorage();
