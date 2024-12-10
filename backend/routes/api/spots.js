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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../utils/auth");
const db_1 = require("../../utils/db");
const validation_1 = require("../../utils/validation");
const router = (0, express_1.Router)();
const getSpot = (spotId, res, onSuccess) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(spotId);
    if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid spot id' });
        return;
    }
    const spot = yield db_1.prisma.spot.findUnique({
        where: { id },
    });
    if (!spot) {
        res.status(404).json({ message: "Spot couldn't be found" });
        return;
    }
    yield onSuccess(id);
});
router.get('/', validation_1.getChecks, validation_1.handleValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = '1', size = '20', minLat, maxLat, minLng, maxLng, minPrice, maxPrice, } = req.query;
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (minLat && { lat: { gte: parseFloat(minLat) } })), (maxLat && { lat: { lte: parseFloat(maxLat) } })), (minLng && { lng: { gte: parseFloat(minLng) } })), (maxLng && { lng: { lte: parseFloat(maxLng) } })), (minPrice && { price: { gte: parseFloat(minPrice) } })), (maxPrice && { price: { lte: parseFloat(maxPrice) } }));
    const spots = yield db_1.prisma.spot.findMany({
        where,
        take: sizeNum,
        skip: (pageNum - 1) * sizeNum,
        include: {
            SpotImages: {
                where: { preview: true },
                select: { url: true },
            },
            Reviews: {
                select: { stars: true },
            },
        },
    });
    res.json({
        Spots: spots.map((spot) => {
            var _a;
            return (Object.assign(Object.assign({}, spot), { previewImage: ((_a = spot.SpotImages[0]) === null || _a === void 0 ? void 0 : _a.url) || null, avgRating: spot.Reviews.length
                    ? spot.Reviews.reduce((sum, review) => sum + review.stars, 0) /
                        spot.Reviews.length
                    : null }));
        }),
        page: pageNum,
        size: sizeNum,
    });
}));
router.get('/current', auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const spots = yield db_1.prisma.spot.findMany({
        where: { ownerId: req.user.id },
        include: {
            SpotImages: {
                where: { preview: true },
                select: { url: true },
            },
            Reviews: {
                select: { stars: true },
            },
        },
    });
    res.json({
        Spots: spots.map((spot) => {
            var _a;
            return (Object.assign(Object.assign({}, spot), { previewImage: ((_a = spot.SpotImages[0]) === null || _a === void 0 ? void 0 : _a.url) || null, avgRating: spot.Reviews.length
                    ? spot.Reviews.reduce((sum, review) => sum + review.stars, 0) /
                        spot.Reviews.length
                    : null }));
        }),
    });
}));
router.get('/:spotId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield db_1.prisma.spot.findUnique({
            where: { id },
            include: {
                Owner: {
                    select: { id: true, firstName: true, lastName: true },
                },
                SpotImages: {
                    select: { id: true, url: true, preview: true },
                },
                Reviews: {
                    select: { stars: true },
                },
            },
        });
        const numReviews = spot.Reviews.length;
        const avgStarRating = numReviews
            ? spot.Reviews.reduce((sum, review) => sum + review.stars, 0) /
                numReviews
            : null;
        res.json(Object.assign(Object.assign({}, spot), { numReviews,
            avgStarRating, SpotImages: spot.SpotImages, Owner: spot.Owner }));
    }));
}));
router.post('/', auth_1.requireAuth, validation_1.validateNewSpot, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const spot = yield db_1.prisma.spot.create({
        data: Object.assign(Object.assign({}, req.body), { ownerId: req.user.id }),
    });
    res.status(201).json(spot);
}));
router.post('/:spotId/images', auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield db_1.prisma.spot.findUnique({
            where: { id },
        });
        if (spot.ownerId !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const image = yield db_1.prisma.spotImage.create({
            data: {
                spotId: id,
                url: req.body.url,
                preview: req.body.preview,
            },
        });
        res.json({
            id: image.id,
            url: image.url,
            preview: image.preview,
        });
    }));
}));
router.put('/:spotId', auth_1.requireAuth, validation_1.validateNewSpot, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield db_1.prisma.spot.findUnique({
            where: { id },
        });
        if (spot.ownerId !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const updatedSpot = yield db_1.prisma.spot.update({
            where: { id },
            data: req.body,
        });
        res.json(updatedSpot);
    }));
}));
router.delete('/:spotId', auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield db_1.prisma.spot.findUnique({
            where: { id },
        });
        if (spot.ownerId !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        yield db_1.prisma.spot.delete({
            where: { id },
        });
        res.json({ message: 'Successfully deleted' });
    }));
}));
router.post('/:spotId/bookings', auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate: sd, endDate: ed } = req.body;
    const startDate = new Date(sd);
    const endDate = new Date(ed);
    if (endDate <= startDate) {
        res.status(400).json({
            message: 'Bad Request',
            errors: {
                endDate: 'endDate cannot be on or before startDate',
            },
        });
        return;
    }
    yield getSpot(req.params.spotId, res, (spotId) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield db_1.prisma.spot.findUnique({
            where: { id: spotId },
            include: {
                Bookings: true,
            },
        });
        if (spot.ownerId === req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const conflictingBooking = spot.Bookings.find((booking) => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return ((startDate >= bookingStart && startDate <= bookingEnd) ||
                (endDate >= bookingStart && endDate <= bookingEnd) ||
                (startDate <= bookingStart && endDate >= bookingEnd));
        });
        if (conflictingBooking) {
            res.status(403).json({
                message: 'Sorry, this spot is already booked for the specified dates',
                errors: {
                    startDate: 'Start date conflicts with an existing booking',
                    endDate: 'End date conflicts with an existing booking',
                },
            });
            return;
        }
        const booking = yield db_1.prisma.booking.create({
            data: {
                spotId,
                userId: req.user.id,
                startDate,
                endDate,
            },
        });
        res.json(booking);
    }));
}));
router.get('/:spotId/bookings', auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (spotId) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield db_1.prisma.spot.findUnique({
            where: { id: spotId },
        });
        const bookings = yield db_1.prisma.booking.findMany({
            where: { spotId },
            include: {
                User: spot.ownerId === req.user.id
                    ? {
                        select: { id: true, firstName: true, lastName: true },
                    }
                    : false,
            },
        });
        res.json({ Bookings: bookings });
    }));
}));
exports.default = router;
