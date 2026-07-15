/**
 * Shared TypeScript interfaces matching backend Pydantic schemas.
 * Single source of truth for all API response/request shapes.
 */

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'pet_owner' | 'veterinarian' | 'clinic_admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserCreatePayload {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserUpdatePayload {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginPayload {
  username: string; // backend uses OAuth2PasswordRequestForm which expects `username`
  password: string;
}

// ─── Pet ─────────────────────────────────────────────────────────────────────

export type Species =
  | 'Dog' | 'Cat' | 'Cow' | 'Buffalo' | 'Sheep'
  | 'Goat' | 'Horse' | 'Pig' | 'Rabbit' | 'Other';

export type Gender = 'Male' | 'Female' | 'Unknown';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: Species;
  breed: string | null;
  gender: Gender;
  weight: number | null;
  date_of_birth: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PetCreatePayload {
  name: string;
  species: Species;
  breed?: string;
  gender?: Gender;
  weight?: number;
  date_of_birth?: string;
  image_url?: string;
}

export interface PetUpdatePayload {
  name?: string;
  species?: Species;
  breed?: string;
  gender?: Gender;
  weight?: number;
  date_of_birth?: string;
  image_url?: string;
  is_active?: boolean;
}

// ─── Vaccination ─────────────────────────────────────────────────────────────

export interface Vaccination {
  id: string;
  pet_id: string;
  vaccine_name: string;
  dose_number: number | null;
  batch_number: string | null;
  date_administered: string;
  next_due_date: string | null;
  clinic_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaccinationCreatePayload {
  vaccine_name: string;
  dose_number?: number;
  batch_number?: string;
  date_administered: string;
  next_due_date?: string;
  clinic_name?: string;
  notes?: string;
}

export interface VaccinationUpdatePayload {
  vaccine_name?: string;
  dose_number?: number;
  batch_number?: string;
  date_administered?: string;
  next_due_date?: string;
  clinic_name?: string;
  notes?: string;
}

// ─── Medical Record ──────────────────────────────────────────────────────────

export interface MedicalRecord {
  id: string;
  pet_id: string;
  visit_date: string;
  diagnosis: string;
  treatment: string | null;
  medicines: string | null;
  doctor_name: string | null;
  clinic_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordCreatePayload {
  pet_id: string;
  visit_date: string;
  diagnosis: string;
  treatment?: string;
  medicines?: string;
  doctor_name?: string;
  clinic_name?: string;
  notes?: string;
}

export interface MedicalRecordUpdatePayload {
  visit_date?: string;
  diagnosis?: string;
  treatment?: string;
  medicines?: string;
  doctor_name?: string;
  clinic_name?: string;
  notes?: string;
}

// ─── Prediction ──────────────────────────────────────────────────────────────

export interface PredictionResult {
  predicted_disease: string;
  confidence: number;
  dangerous: boolean;
  recommendation: string;
}

export interface PredictionDetail {
  id: string;
  pet_id: string;
  symptoms: string[] | Record<string, unknown>;
  predicted_disease: string;
  confidence: number;
  dangerous: boolean;
  model_version: string;
  processing_time_ms: number;
  created_at: string;
  updated_at: string;
}

export interface PredictionHistoryItem {
  id: string;
  date: string;
  pet_name: string;
  predicted_disease: string;
  confidence: number;
}

export interface PredictionRequestPayload {
  pet_id: string;
  symptoms: string[];
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  pet_id: string;
  pet_name?: string;
  veterinarian_name: string | null;
  clinic_name: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreatePayload {
  pet_id: string;
  health_centre_id?: string;
  doctor_id?: string;
  veterinarian_name?: string;
  clinic_name?: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  notes?: string;
}

export interface AppointmentUpdatePayload {
  veterinarian_name?: string;
  clinic_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  reason?: string;
  status?: AppointmentStatus;
  notes?: string;
}

// ─── NGO ─────────────────────────────────────────────────────────────────────

export interface NGO {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  services: string[];
  address: string;
  city: string;
  state: string;
  emergency_contact: string;
  working_hours: Record<string, string> | null;
  location_lat: number | null;
  location_lng: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NGOCreatePayload {
  name: string;
  description?: string;
  services?: string[];
  address: string;
  city: string;
  state: string;
  emergency_contact: string;
  working_hours?: Record<string, string>;
  location_lat?: number;
  location_lng?: number;
}

// ─── Health Centre ───────────────────────────────────────────────────────────

export interface HealthCentre {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  facilities: string[];
  address: string;
  city: string;
  state: string;
  contact_number: string;
  timings: Record<string, string> | null;
  emergency_services: boolean;
  location_lat: number | null;
  location_lng: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthCentreCreatePayload {
  name: string;
  description?: string;
  facilities?: string[];
  address: string;
  city: string;
  state: string;
  contact_number: string;
  timings?: Record<string, string>;
  emergency_services?: boolean;
  location_lat?: number;
  location_lng?: number;
}

// ─── Rescue Request ──────────────────────────────────────────────────────────

export type RescueStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';

export interface RescueRequest {
  id: string;
  pet_owner_id: string;
  ngo_id: string | null;
  description: string;
  image_url: string | null;
  location_lat: number;
  location_lng: number;
  address: string | null;
  emergency_priority: boolean;
  status: RescueStatus;
  created_at: string;
  updated_at: string;
}

export interface RescueRequestCreatePayload {
  description: string;
  image_url?: string;
  location_lat: number;
  location_lng: number;
  address?: string;
  emergency_priority?: boolean;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | { msg: string; type: string; loc: string[] }[];
}
