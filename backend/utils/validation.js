"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = handleValidationErrors;
exports.bookingOverlap = bookingOverlap;
exports.parseI32 = parseI32;
const express_validator_1 = require("express-validator");
const dbclient_js_1 = require("../dbclient.js");
function handleValidationErrors(req, res, next) {
    const validationErrors = (0, express_validator_1.validationResult)(req);
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
function bookingOverlap(spot, start, end) {
    return dbclient_js_1.prisma.booking.findFirst({
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
