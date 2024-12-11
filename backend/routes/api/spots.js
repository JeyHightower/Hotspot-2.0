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
const auth_js_1 = require("../../utils/auth.js");
const dbclient_js_1 = require("../../dbclient.js");
const validation_js_1 = require("../../utils/validation.js");
const router = (0, express_1.Router)();
const getSpot = (spotId, res, onSuccess) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(spotId);
    if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid spot id' });
        return;
    }
    const spot = yield dbclient_js_1.prisma.spot.findUnique({
        where: { id },
    });
    if (!spot) {
        res.status(404).json({ message: "Spot couldn't be found" });
        return;
    }
    yield onSuccess(id);
});
router.get('/', validation_js_1.handleValidationErrors, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = '1', size = '20', minLat, maxLat, minLng, maxLng, minPrice, maxPrice, } = req.query;
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (minLat && { lat: { gte: parseFloat(minLat) } })), (maxLat && { lat: { lte: parseFloat(maxLat) } })), (minLng && { lng: { gte: parseFloat(minLng) } })), (maxLng && { lng: { lte: parseFloat(maxLng) } })), (minPrice && { price: { gte: parseFloat(minPrice) } })), (maxPrice && { price: { lte: parseFloat(maxPrice) } }));
    const spots = yield dbclient_js_1.prisma.spot.findMany({
        where,
        take: sizeNum,
        skip: (pageNum - 1) * sizeNum,
        include: {
            images: {
                where: { preview: true },
                select: { url: true },
            },
            reviews: {
                select: { stars: true },
            },
        },
    });
    res.json({
        Spots: spots.map((spot) => {
            var _a;
            return (Object.assign(Object.assign({}, spot), { previewImage: ((_a = spot.images[0]) === null || _a === void 0 ? void 0 : _a.url) || null, avgRating: spot.reviews.length
                    ? spot.reviews.reduce((sum, review) => sum + review.stars, 0) /
                        spot.reviews.length
                    : null }));
        }),
        page: pageNum,
        size: sizeNum,
    });
})));
router.get('/current', auth_js_1.requireAuth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const spots = yield dbclient_js_1.prisma.spot.findMany({
        where: { ownerId: req.user.id },
        include: {
            images: {
                where: { preview: true },
                select: { url: true },
            },
            reviews: {
                select: { stars: true },
            },
        },
    });
    res.json({
        Spots: spots.map((spot) => {
            var _a;
            return (Object.assign(Object.assign({}, spot), { previewImage: ((_a = spot.images[0]) === null || _a === void 0 ? void 0 : _a.url) || null, avgRating: spot.reviews.length
                    ? spot.reviews.reduce((sum, review) => sum + review.stars, 0) /
                        spot.reviews.length
                    : null }));
        }),
    });
})));
router.post('/', auth_js_1.requireAuth, validation_js_1.handleValidationErrors, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const spot = yield dbclient_js_1.prisma.spot.create({
        data: Object.assign(Object.assign({}, req.body), { ownerId: req.user.id }),
    });
    res.status(201).json(spot);
})));
router.get('/:spotId', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield dbclient_js_1.prisma.spot.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, firstName: true, lastName: true },
                },
                images: {
                    select: { id: true, url: true, preview: true },
                },
                reviews: {
                    select: { stars: true },
                },
            },
        });
        const numReviews = spot.reviews.length;
        const avgStarRating = numReviews
            ? spot.reviews.reduce((sum, review) => sum + review.stars, 0) / numReviews
            : null;
        res.json(Object.assign(Object.assign({}, spot), { numReviews,
            avgStarRating, SpotImages: spot.images, Owner: spot.owner }));
    }));
})));
router.post('/:spotId/images', auth_js_1.requireAuth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const spot = yield dbclient_js_1.prisma.spot.findUnique({
            where: { id },
        });
        if (spot.ownerId !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const image = yield dbclient_js_1.prisma.spotImage.create({
            data: {
                spotId: id,
                url: req.body.url,
                preview: (_a = req.body.preview) !== null && _a !== void 0 ? _a : false,
            },
        });
        res.json({
            id: image.id,
            url: image.url,
            preview: image.preview,
        });
    }));
})));
((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params['spotId'], res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const spot = yield dbclient_js_1.prisma.spot.findUnique({
            where: { id },
        });
        if (spot.ownerId !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const image = yield dbclient_js_1.prisma.spotImage.create({
            data: {
                spotId: id,
                url: req.body.url,
                preview: (_a = req.body.preview) !== null && _a !== void 0 ? _a : false,
            },
        });
        res.json({
            id: image.id,
            url: image.url,
            preview: image.preview,
        });
    }));
}));
router.put('/:spotId', auth_js_1.requireAuth, validation_js_1.handleValidationErrors, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield dbclient_js_1.prisma.spot.findUnique({
            where: { id },
        });
        if (spot.ownerId !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const updatedSpot = yield dbclient_js_1.prisma.spot.update({
            where: { id },
            data: req.body,
        });
        res.json(updatedSpot);
    }));
})));
router.delete('/:spotId', auth_js_1.requireAuth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (id) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield dbclient_js_1.prisma.spot.findUnique({
            where: { id },
        });
        if (spot.ownerId !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        yield dbclient_js_1.prisma.spot.delete({
            where: { id },
        });
        res.json({ message: 'Successfully deleted' });
    }));
})));
router.post('/:spotId/bookings', auth_js_1.requireAuth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const spot = yield dbclient_js_1.prisma.spot.findUnique({
            where: { id: spotId },
            include: {
                bookings: true,
            },
        });
        if (spot.ownerId === req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const conflictingBooking = spot.bookings.find((booking) => {
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
        const booking = yield dbclient_js_1.prisma.booking.create({
            data: {
                spotId,
                userId: req.user.id,
                startDate,
                endDate,
            },
        });
        res.json(booking);
    }));
})));
router.get('/:spotId/bookings', auth_js_1.requireAuth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getSpot(req.params.spotId, res, (spotId) => __awaiter(void 0, void 0, void 0, function* () {
        const spot = yield dbclient_js_1.prisma.spot.findUnique({
            where: { id: spotId },
        });
        const bookings = yield dbclient_js_1.prisma.booking.findMany({
            where: { spotId },
            include: {
                user: spot.ownerId === req.user.id
                    ? {
                        select: { id: true, firstName: true, lastName: true },
                    }
                    : false,
            },
        });
        res.json({ Bookings: bookings });
    }));
})));
exports.default = router;
