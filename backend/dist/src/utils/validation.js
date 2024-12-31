"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = handleValidationErrors;
exports.bookingOverlap = bookingOverlap;
exports.parseI32 = parseI32;
// import { PrismaClient } from '@prisma/client';
const express_validator_1 = require("express-validator");
const prismaClient_1 = require("../prismaClient");
// Remove the redundant declaration of prisma
// const prisma = new PrismaClient();
function handleValidationErrors(req, res, next) {
    const validationErrors = (0, express_validator_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        const errors = {};
        validationErrors.array().forEach((error) => {
            if ("path" in error && "msg" in error) {
                errors[error.path] = error.msg;
            }
        });
        const err = new Error("Bad Request");
        err.errors = errors;
        err.status = 400;
        return next(err);
    }
    next();
}
function bookingOverlap(spot, start, end) {
    return prismaClient_1.prismaClient.booking.findFirst({
        where: {
            spotId: spot,
            endDate: { gte: start },
            startDate: { lte: end },
        },
    });
}
function parseI32(v) {
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
//# sourceMappingURL=validation.js.map