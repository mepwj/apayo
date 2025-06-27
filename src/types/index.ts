export interface BodyPart {
  id: string;
  name: string;
  path: string;
  commonSymptoms: string[];
}

export interface Symptom {
  id: string;
  name: string;
  icon?: string;
  severity?: number;
  bodyParts: string[];
}

export interface Disease {
  name: string;
  probability: number;
  urgency: 'emergency' | 'urgent' | 'normal';
  specialists: string[];
  description?: string;
}

export interface SymptomAnalysisRequest {
  bodyPart: string;
  symptoms: string[];
  severity: number;
}

export interface SymptomAnalysisResponse {
  predictions: Disease[];
  recommendedAction: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  specialists: string[];
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  operatingHours?: string;
  isOpen?: boolean;
  rating?: number;
}