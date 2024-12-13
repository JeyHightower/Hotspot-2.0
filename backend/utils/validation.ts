import { NextFunction, Request, Response } from 'express';

import { Booking } from '@prisma/client';
import { validationResult } from 'express-validator';
import { prisma } from '../dbclient.js';

export function handleValidationErrors(
req: Request, res: Response, next: NextFunction, Response: any, next: any, NextFunction: any,
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
