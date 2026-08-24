import { ResourceCategory } from './booking.types';

export interface FacilityResource {
  id: string;
  name: string;
  slug: string;
  category: ResourceCategory;
  description: string;
  capacity: number;
  location: string;
  amenities: string[];
  imageUrl?: string;
  isActive: boolean;
  pricing: ResourcePricing[];
}

export interface ResourcePricing {
  id: string;
  planName: string;
  durationHours?: number;
  durationDays?: number;
  durationMonths?: number;
  price: number;
  currency: string;
  isPopular?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  clientId: string;
  role: string;
  isVerified: boolean;
  avatarUrl?: string;
}
