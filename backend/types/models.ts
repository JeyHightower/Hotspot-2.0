export interface SpotType {
  id: number;
  ownerId: number;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number | string;
  lng: number | string;
  name: string;
  description: string;
  price: number | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewType {
  id: number;
  userId: number;
  spotId: number;
  review: string;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
  spot: {
    images: Array<{ url: string }>;
    lat: number | string | Decimal;
    lng: number | string | Decimal;
    price: number | string | Decimal;
    [key: string]: any;
  };
  images: Array<{ url: string; id: number }>;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
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

export interface SpotWithRelations extends Omit<SpotType, 'lat' | 'lng' | 'price'> {
  reviews: Array<{ stars: number }>;
  images: Array<{ url: string }>;
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  lat: number;
  lng: number;
  price: number;
}
