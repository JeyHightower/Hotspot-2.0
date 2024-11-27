import { Request, Response, NextFunction } from 'express';

import { validationResult } from "express-validator";
import { prisma } from "../dbclient.js";
import { Booking } from "@prisma/client";

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

		const err = Error("Bad Request");
		err.errors = errors;
		err.status = 400;
		err.title = "Bad Request";
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
