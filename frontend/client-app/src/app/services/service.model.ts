export interface Service {
  id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  rating?: number;
  ownerId?: string;
} 