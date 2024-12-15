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
    const errors: { [key: string]: string } = {};

    validationErrors
      .array()
      .forEach((error) => {
        if ('path' in error && 'msg' in error) {
          errors[error.path as string] = error.msg as string;
        }
      });

    const err = new Error('Bad Request') as Error & { errors?: typeof errors; status?: number };
    err.errors = errors;
    err.status = 400;
    return next(err);
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
