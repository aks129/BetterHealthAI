import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) return "fas fa-file-pdf";
  if (mimeType.includes("image")) return "fas fa-file-image";
  if (mimeType.includes("document") || mimeType.includes("text")) return "fas fa-file-alt";
  return "fas fa-file";
}

export function getFileIconColor(mimeType: string): string {
  if (mimeType.includes("pdf")) return "text-red-500";
  if (mimeType.includes("image")) return "text-blue-500";
  if (mimeType.includes("document") || mimeType.includes("text")) return "text-green-500";
  return "text-gray-500";
}

export function detectEmergencyKeywords(text: string): boolean {
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'bleeding', 'unconscious', 
    'difficulty breathing', 'severe pain', 'suicide', 'overdose',
    'can\'t breathe', 'choking', 'seizure', 'allergic reaction'
  ];
  
  const lowerText = text.toLowerCase();
  return emergencyKeywords.some(keyword => lowerText.includes(keyword));
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export function generateStars(rating: number): string[] {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push("fas fa-star");
  }
  
  if (hasHalfStar) {
    stars.push("fas fa-star-half-alt");
  }
  
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push("far fa-star");
  }
  
  return stars;
}
