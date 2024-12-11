import { NextFunction, Request, Response } from 'express';

import { Booking } from '@prisma/client';
import { validationResult } from 'express-validator';
import { prisma } from '../dbclient.js';

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};

    validationErrors
      .array()
      //@ts-ignore
      .forEach((error) => (errors[error.path] = error.msg));

    const err = Error('Bad Request');
    err.errors = errors;
    err.status = 400;
    err.title = 'Bad Request';
    next(err);
  }
  next();
}

export function bookingOverlap(
  spot: number,
  start: Date,
  end: Date,
): Promise<Booking | null> {
  return prisma.booking.findFirst({
    where: {
      spotId: spot,
      endDate: { gte: start },
      startDate: { lte: end },
    },
  });
}

export function parseI32(v: string | undefined): number | null {
  try {
    const val = BigInt(v!);

    if (val !== BigInt.asIntN(32, val)) {
      return null;
    }

    return Number(val);
  } catch (e) {
    return null;
  }
}

export function validateNewSpot(
  name: string,
  description: string,
  price: number,
  address: string,
  city: string,
  state: string,
  country: string,
  lat: number,
  lng: number): string | undefined {
  if (!name || name.length < 1 || name.length > 49) {
    return 'Name must be between 1 and 49 characters';
  }
  if (!description || description.length < 1 || description.length > 500) {
    return 'Description must be between 1 and 500 characters';
  }
  if (!price || price < 0 || price > 1000000) {
    return 'Price must be between 0 and 1,000,000';
  }
  if (!address || address.length < 1 || address.length > 100) {
    return 'Address must be between 1 and 100 characters';
  }
  if (!city || city.length < 1 || city.length > 50) {
    return 'City must be between 1 and 50 characters';
  }
  if (!state || state.length < 1 || state.length > 50) {
    return 'State must be between 1 and 50 characters';
  }
  if (!country || country.length < 1 || country.length > 50) {
    return 'Country must be between 1 and 50 characters';
  }
  if (!lat || lat < -90 || lat > 90) {
    return 'Latitude must be between -90 and 90';
  }
  if (!lng || lng < -180 || lng > 180) {
    return 'Longitude must be between -180 and 180';
  }
  return undefined;
}