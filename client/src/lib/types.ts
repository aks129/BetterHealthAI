export interface EmergencyKeyword {
  keyword: string;
  severity: 'high' | 'medium' | 'low';
}

export const EMERGENCY_KEYWORDS: EmergencyKeyword[] = [
  { keyword: 'chest pain', severity: 'high' },
  { keyword: 'heart attack', severity: 'high' },
  { keyword: 'stroke', severity: 'high' },
  { keyword: 'severe bleeding', severity: 'high' },
  { keyword: 'unconscious', severity: 'high' },
  { keyword: 'trouble breathing', severity: 'high' },
  { keyword: 'severe allergic reaction', severity: 'high' },
  { keyword: 'poisoning', severity: 'high' },
  { keyword: 'severe burns', severity: 'high' },
  { keyword: 'severe trauma', severity: 'high' },
  { keyword: 'suicidal thoughts', severity: 'high' },
  { keyword: 'severe pain', severity: 'medium' },
  { keyword: 'difficulty breathing', severity: 'medium' },
  { keyword: 'severe headache', severity: 'medium' },
];

export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface ServiceFeature {
  title: string;
  description: string;
  icon: string;
  features: string[];
  actionText: string;
  actionHref: string;
}

export interface SafetyFeature {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
}
