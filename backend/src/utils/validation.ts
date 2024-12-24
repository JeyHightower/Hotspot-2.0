import { NextFunction, Request, Response } from "express";
// import { PrismaClient } from '@prisma/client';
import { ValidationError, validationResult } from "express-validator";
import { prismaClient as prisma } from  "../prismaClient"

// Remove the redundant declaration of prisma
// const prisma = new PrismaClient();
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors: { [key: string]: string } = {};

    validationErrors.array().forEach((error: ValidationError) => {
      if ("path" in error && "msg" in error) {
        errors[error.path as string] = error.msg as string;
      }
    });

    const err = new Error("Bad Request") as Error & {
      errors?: typeof errors;
      status?: number;
    };
    err.errors = errors;
    err.status = 400;
    return next(err);
  }
  next();
}

// import { PrismaClient } from '@prisma/client/edge';
// const prisma = new PrismaClient();
type Booking = Awaited<ReturnType<typeof prisma.booking.findFirst>>;

export function bookingOverlap(
  spot: number,
  start: Date,
  end: Date
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
