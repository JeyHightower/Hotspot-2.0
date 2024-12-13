import { validationResult } from 'express-validator';
import { prisma } from '../dbclient.js';
export function handleValidationErrors(req, res, next) {
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
export function bookingOverlap(spot, start, end) {
    return prisma.booking.findFirst({
        where: {
            spotId: spot,
            endDate: { gte: start },
            startDate: { lte: end },
        },
    });
}
export function parseI32(v) {
    try {
        const val = BigInt(v);
        if (val !== BigInt.asIntN(32, val)) {
            return null;
        }
        return Number(val);
    }
    catch (e) {
        return null;
    }
}
