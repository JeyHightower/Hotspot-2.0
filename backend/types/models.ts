import { Decimal } from '@prisma/client/runtime';

export interface Spot {
  id: number
  ownerId: number
  address: string
  city: string
  state: string
  country: string
  lat: number
  lng: number
  name: string
  description: string
  price: number
  reviews?: Review[]
  images?: SpotImage[]
  owner?: User
  createdAt: Date
  updatedAt: Date
}

interface SpotWithRelations extends Omit<SpotType, 'lat' | 'lng' | 'price'> {
  reviews: Array<{ stars: number }>;
  images: Array<{ url: string }>;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
  };
  lat: number;
  lng: number;
  price: number;
}

export interface Review {
  id: number
  userId: number
  spotId: number
  review: string
  stars: number
}

export interface SpotImage {
  id: number
  url: string
  preview: boolean
}

export interface User {
  id: number
  firstName: string
  lastName: string
}
