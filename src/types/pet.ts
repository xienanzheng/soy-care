export type MoistureLevel = 'dry' | 'normal' | 'wet';
export type RiskLevel = 'normal' | 'watch' | 'see_vet';

export interface Pet {
  id: string;
  name: string;
  handle: string;
  species: string;
  breed: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  weight?: number;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  ownerName?: string;
  medicalHistory?: string;
  allergies?: string;
  favoriteActivities?: string;
  personality?: string;
}

export interface FoodLog {
  id: string;
  petId: string;
  foodName: string;
  amountGrams: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  timestamp: string;
  photoUrl?: string;
  calories?: number;
  proteinPercent?: number;
  fatPercent?: number;
  carbPercent?: number;
}

export interface SupplementLog {
  id: string;
  petId: string;
  supplementName: string;
  dosage: string;
  frequency: 'daily' | 'weekly' | 'as_needed';
  notes?: string;
  photoUrl?: string;
  timestamp: string;
  purpose?: string;
}

export interface PoopLog {
  id: string;
  petId: string;
  consistency: 'regular' | 'soft' | 'sticky' | 'hard' | 'diarrhea';
  color:
    | 'brown'
    | 'dark_brown'
    | 'light_brown'
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'orange'
    | 'white'
    | 'grey'
    | 'clay';
  amount: 'small' | 'medium' | 'large';
  location: string;
  notes?: string;
  photoUrl?: string;
  thumbnailUrl?: string;
  timestamp: string;
  userRating?: number; // 1-10 subjective rating
  // AI-ready fields
  aiStatus: 'not_requested' | 'pending' | 'completed' | 'failed';
  aiLabels?: Record<string, unknown>;
  aiSummary?: string;
  aiRiskLevel?: 'normal' | 'watch' | 'see_vet';
  bloodPresent?: boolean;
  mucusPresent?: boolean;
  moistureLevel?: MoistureLevel;
  smellLevel?: number;
  undesirableBehaviors?: string[];
  undesirableBehaviorNotes?: string;
}

export interface MeasurementLog {
  id: string;
  petId: string;
  weightKg?: number;
  neckCm?: number;
  chestCm?: number;
  bodyLengthCm?: number;
  notes?: string;
  timestamp: string;
}

export type LogType = 'food' | 'poop' | 'supplement' | 'measurement';

export interface HealthNote {
  id: string;
  petId: string;
  summary: string;
  recommendations?: string;
  riskLevel?: RiskLevel;
  ownerMessage?: string;
  createdAt: string;
}

export interface ChallengeProgress {
  id: string;
  petId: string;
  title: string;
  subtitle?: string;
  progress: number;
  goal: number;
  streakDays?: number;
}

export interface CommunityPost {
  id: string;
  petId: string;
  ownerName: string;
  content: string;
  photoUrl?: string;
  likes?: number;
  createdAt: string;
}

export interface MealPreset {
  id: string;
  name: string;
  defaultFoodName: string;
  defaultMealType?: FoodLog['mealType'];
  defaultAmountGrams?: number;
  defaultCalories?: number;
  defaultProteinPercent?: number;
  defaultFatPercent?: number;
  defaultCarbPercent?: number;
  notes?: string;
  createdAt?: string;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDue?: string;
  vetName?: string;
  clinic?: string;
  lotNumber?: string;
  documentUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface HealthCertificateRecord {
  id: string;
  petId: string;
  title: string;
  issuedAt: string;
  expiresAt?: string;
  vetName?: string;
  clinic?: string;
  documentUrl?: string;
  notes?: string;
  createdAt?: string;
}
