"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../../utils/validation");
const router = (0, express_1.Router)();
const prismaClient_1 = require("../../prismaClient");
const auth_1 = require("../../utils/auth");
function formatDate(d) {
    return d.toISOString().split("T")[0];
}
router.get("/current", auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let bookings = yield prismaClient_1.prismaClient.booking.findMany({
        where: { userId: user.id },
        include: {
            spot: {
                select: {
                    images: { where: { preview: true }, select: { url: true } },
                    id: true,
                    ownerId: true,
                    address: true,
                    city: true,
                    state: true,
                    country: true,
                    lat: true,
                    lng: true,
                    name: true,
                    price: true,
                },
            },
        },
    });
    const sequelized = bookings.map((b) => {
        var _a, _b;
        const { spot, startDate, endDate } = b, rest = __rest(b, ["spot", "startDate", "endDate"]);
        const { images } = spot, spotRest = __rest(spot, ["images"]);
        return Object.assign({ Spot: Object.assign({ previewImage: (_b = (_a = images[0]) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : "" }, spotRest), startDate: startDate.toDateString(), endDate: endDate.toDateString() }, rest);
    });
    res.json({ Bookings: sequelized });
}));
const validateNewBooking = [
    (0, express_validator_1.check)("startDate")
        .exists({ checkFalsy: true })
        .isDate()
        .withMessage("startDate is required"),
    (0, express_validator_1.check)("endDate")
        .exists({ checkFalsy: true })
        .isDate()
        .withMessage("endDate is required"),
    validation_1.handleValidationErrors,
];
router.put("/:bookingId", auth_1.requireAuth, validateNewBooking, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let bookingId = (0, validation_1.parseI32)(req.params["bookingId"]);
    const { startDate, endDate } = req.body;
    if (!bookingId) {
        res.status(404).json({
            message: "Booking couldn't be found",
        });
        return;
    }
    const booking = yield prismaClient_1.prismaClient.booking.findUnique({
        where: { id: bookingId },
        include: { spot: true },
    });
    if (!booking) {
        res.status(404).json({
            message: "Booking couldn't be found",
        });
        return;
    }
    if (booking.userId !== user.id) {
        res
            .status(403)
            .json({ message: "You do not have permission to edit this booking" });
        return;
    }
    if (startDate >= endDate) {
        res.status(400).json({
            message: "Bad Request",
            errors: { endDate: "endDate cannot be on or before startDate" },
        });
        return;
    }
    let overlap = yield prismaClient_1.prismaClient.booking.findFirst({
        where: {
            spotId: booking.spot.id,
            NOT: {
                id: booking.id,
            },
            endDate: { gte: startDate },
            startDate: { lte: endDate },
        },
    });
    if (overlap) {
        let err = {
            message: "Sorry, this spot is already booked for the specified dates",
            errors: {},
        };
        if (overlap.startDate <= startDate && startDate <= overlap.endDate) {
            err.errors.startDate = "Start date conflicts with an existing booking";
        }
        if (overlap.startDate <= endDate && endDate <= overlap.endDate) {
            err.errors.endDate = "End date conflicts with an existing booking";
        }
        res.status(403).json(err);
        return;
    }
    const newBooking = yield prismaClient_1.prismaClient.booking.update({
        where: { id: booking.id },
        data: {
            startDate,
            endDate,
        },
    });
    res.status(201).json(Object.assign(Object.assign({}, newBooking), { startDate: formatDate(newBooking.startDate), endDate: formatDate(newBooking.endDate) }));
}));
router.delete("/:bookingId", auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    if (isNaN(Number(bookingId)) || Number(bookingId) > Math.pow(2, 31)) {
        res.status(404).json({ message: "Booking couldn't be found" });
        return;
    }
    const userId = req.user.id;
    try {
        const booking = yield prismaClient_1.prismaClient.booking.findUnique({
            where: {
                id: Number(bookingId),
            },
            include: {
                spot: {
                    select: {
                        ownerId: true,
                    },
                },
            },
        });
        if (!booking) {
            if (!(yield prismaClient_1.prismaClient.booking.findUnique({
                where: { id: Number(bookingId) },
            }))) {
                res.status(404).json({ message: "Booking couldn't be found" });
                return;
            }
            res
                .status(403)
                .json({ message: "You are not authorized to delete this booking" });
            return;
        }
        if (booking.userId !== userId && booking.spot.ownerId !== userId) {
            res
                .status(403)
                .json({ message: "You are not authorized to delete this booking" });
            return;
        }
        yield prismaClient_1.prismaClient.booking.delete({ where: { id: Number(bookingId) } });
        res.status(200).json({ message: "successfully deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
exports.default = router;
