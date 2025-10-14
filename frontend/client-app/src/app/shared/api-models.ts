export type ID = string | number;

// Reuse the canonical Service interface from services to avoid type duplication
import { Service } from '../services/service.model';

export type ServiceModel = Service;

export interface Reservation {
  id?: ID;
  service?: ServiceModel;
  reservationDate?: string;
  startDate?: string;
  endDate?: string;
}

// Create payload: accept either { serviceId } or { service: { id } }
export type ReservationCreate =
  | { serviceId: ID }
  | { service: { id: ID } };

export interface Review {
  id?: ID;
  service?: ServiceModel;
  rating?: number;
  comment?: string;
}

export type ReviewCreate =
  | { serviceId: ID; rating: number; comment?: string }
  | { service: { id: ID }; rating: number; comment?: string };

export interface Recommendation {
  id?: ID;
  title?: string;
  category?: string;
  price?: number;
  location?: string;
  rating?: number;
}
