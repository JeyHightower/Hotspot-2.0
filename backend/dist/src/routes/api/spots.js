"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prismaClient_1 = require("../../prismaClient");
const auth_1 = require("../../utils/auth");
const validation_1 = require("../../utils/validation");
const router = (0, express_1.Router)();
function transformSpot(wholeSpot) {
    const { images, reviews, lat, lng, price, ...spot } = wholeSpot;
    return {
        ...spot,
        // sequelize is wrong and they codified that in the API
        // whoops!
        lat: Number(lat),
        lng: Number(lng),
        price: Number(price),
        previewImage: images[0]?.url ?? "",
        avgRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length,
    };
}
function parseSpotId(spotId, res) {
    const id = (0, validation_1.parseI32)(spotId);
    if (id !== null) {
        return id;
    }
    else {
        res.status(404).json({ message: "Spot couldn't be found" });
        return null;
    }
}
async function getSpot(id, res, cb) {
    let spotId = parseSpotId(id, res);
    if (spotId) {
        let data = await cb(spotId);
        if (data) {
            return data;
        }
        res.status(404).json({ message: "Spot couldn't be found" });
        return null;
    }
    else {
        return null;
    }
}
function formatDate(d) {
    return d.toISOString().split("T")[0];
}
router.get("/current", auth_1.requireAuth, async (req, res) => {
    const allSpots = await prismaClient_1.prismaClient.spot.findMany({
        where: { ownerId: req.user.id },
        include: {
            images: { where: { preview: true }, select: { url: true } },
            reviews: { select: { stars: true } },
        },
    });
    const modspots = allSpots.map(transformSpot);
    res.json({ Spots: modspots });
});
const validateNewSpot = [
    (0, express_validator_1.check)("address")
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    (0, express_validator_1.check)("city").exists({ checkFalsy: true }).withMessage("City is required"),
    (0, express_validator_1.check)("state").exists({ checkFalsy: true }).withMessage("State is required"),
    (0, express_validator_1.check)("country")
        .exists({ checkFalsy: true })
        .withMessage("Country is required"),
    (0, express_validator_1.check)("lat")
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Latitude is not valid"),
    (0, express_validator_1.check)("lng")
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Longitude is not valid"),
    (0, express_validator_1.check)("name")
        .exists({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage("Name must be less than 50 characters"),
    (0, express_validator_1.check)("description")
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    (0, express_validator_1.check)("price")
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Price per day is required"),
    validation_1.handleValidationErrors,
];
router.get("/:spotId", async (req, res, next) => {
    const spot = await getSpot(req.params.spotId, res, (spotId) => prismaClient_1.prismaClient.spot.findFirst({
        where: { id: spotId },
        include: {
            images: { select: { id: true, url: true, preview: true } },
            reviews: { select: { stars: true } },
            owner: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
    }));
    if (!spot) {
        return next();
    }
    const { reviews, images, owner, lat, lng, price, ...rest } = spot;
    const ret = {
        ...rest,
        lat: Number(lat),
        lng: Number(lng),
        price: Number(price),
        numReviews: reviews.length,
        avgStarRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length,
        SpotImages: images,
        Owner: owner,
    };
    res.json(ret);
});
router.put("/:spotId", auth_1.requireAuth, validateNewSpot, async (req, res, next) => {
    let user = req.user;
    const { address, city, state, country, lat, lng, name, description, price, } = req.body;
    const spot = await getSpot(req.params["spotId"], res, (id) => prismaClient_1.prismaClient.spot.findUnique({ where: { id } }));
    if (!spot) {
        return next();
    }
    if (spot.ownerId !== user.id) {
        res
            .status(403)
            .json({ message: "You do not have permission to edit this spot" });
        return;
    }
    const updated = await prismaClient_1.prismaClient.spot.update({
        where: { id: spot.id },
        data: {
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price,
            updatedAt: new Date(),
        },
    });
    res.status(200).json({ ...updated, lat, lng, price });
});
router.delete("/:spotId", auth_1.requireAuth, async (req, res, next) => {
    let user = req.user;
    const spot = await getSpot(req.params["spotId"], res, (spotId) => prismaClient_1.prismaClient.spot.findFirst({
        where: { id: spotId },
        select: { id: true, ownerId: true },
    }));
    if (!spot) {
        return next();
    }
    if (spot.ownerId !== user.id) {
        res
            .status(403)
            .json({ message: "You do not have permission to delete this spot" });
        return;
    }
    await prismaClient_1.prismaClient.spot.delete({ where: { id: spot.id } });
    res.status(200).json({ message: "Successfully deleted" });
});
router.get("/:spotId/bookings", auth_1.requireAuth, async (req, res) => {
    const user = req.user;
    const spot = await getSpot(req.params["spotId"], res, (id) => prismaClient_1.prismaClient.spot.findUnique({ where: { id } }));
    if (!spot) {
        return;
    }
    if (spot.ownerId == user.id) {
        const bookings = await prismaClient_1.prismaClient.booking.findMany({
            where: {
                spotId: spot.id,
            },
            select: {
                user: { select: { id: true, firstName: true, lastName: true } },
                id: true,
                spotId: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const sequelized = bookings.map((b) => {
            const { user, ...rest } = b;
            return {
                User: user,
                ...rest,
            };
        });
        return res.json({ Bookings: sequelized });
    }
    else {
        const bookings = await prismaClient_1.prismaClient.booking.findMany({
            where: { spotId: spot.id, userId: user.id },
            select: { startDate: true, endDate: true, spotId: true },
        });
        return res.json({ Bookings: bookings });
    }
});
router.get("/:spotId/reviews", async (req, res) => {
    const spot = await getSpot(req.params.spotId, res, (id) => prismaClient_1.prismaClient.spot.findUnique({ where: { id } }));
    if (!spot) {
        return;
    }
    const reviews = await prismaClient_1.prismaClient.review.findMany({
        where: { spotId: spot.id },
        include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            images: { select: { id: true, url: true } },
        },
    });
    const out = reviews.map((r) => {
        const { user, images, ...rest } = r;
        return {
            User: user,
            ReviewImages: images,
            ...rest,
        };
    });
    return res.json({ Reviews: out });
});
const validateReview = [
    (0, express_validator_1.check)("review")
        .exists({ checkFalsy: true })
        .withMessage("Review text is required")
        .isLength({ min: 10 })
        .withMessage("Review must be at least 10 characters long"),
    (0, express_validator_1.check)("stars")
        .exists({ checkFalsy: true })
        .withMessage("Stars rating is required")
        .isInt({ min: 1, max: 5 })
        .withMessage("Stars must be an integer from 1 to 5"),
    validation_1.handleValidationErrors,
];
router.post("/:spotId/reviews", auth_1.requireAuth, validateReview, async (req, res, next) => {
    try {
        const spotId = parseInt(req.params.spotId);
        const userId = req.user.id;
        const { review, stars } = req.body;
        // Check if spot exists
        const spot = await prismaClient_1.prismaClient.spot.findUnique({
            where: { id: spotId },
        });
        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
            });
        }
        // Check if user is the owner
        if (spot.ownerId === userId) {
            return res.status(403).json({
                message: "Spot owner can't leave a review",
            });
        }
        // Check if user already has a review for this specific spot
        const existingReview = await prismaClient_1.prismaClient.review.findFirst({
            where: {
                AND: [{ spotId: spotId }, { userId: userId }],
            },
        });
        if (existingReview) {
            return res.status(403).json({
                message: "User already has a review for this spot",
            });
        }
        // Create the review
        const newReview = await prismaClient_1.prismaClient.review.create({
            data: {
                spotId,
                userId,
                review,
                stars: Number(stars),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        // Format the response
        const formattedReview = {
            id: newReview.id,
            userId: newReview.userId,
            spotId: newReview.spotId,
            review: newReview.review,
            stars: newReview.stars,
            createdAt: newReview.createdAt,
            updatedAt: newReview.updatedAt,
            User: newReview.user,
            ReviewImages: [],
        };
        return res.status(201).json(formattedReview);
    }
    catch (error) {
        console.error("Review creation error:", error);
        next(error);
    }
});
const validateNewSpotImage = [
    (0, express_validator_1.check)("url").exists({ checkFalsy: true }).withMessage("URL is required"),
    (0, express_validator_1.check)("preview").exists().isBoolean().withMessage("Preview flag is required"),
    validation_1.handleValidationErrors,
];
router.post("/:spotId/images", auth_1.requireAuth, validateNewSpotImage, async (req, res) => {
    const user = req.user;
    const { url, preview } = req.body;
    let spot = await getSpot(req.params["spotId"], res, (spotId) => prismaClient_1.prismaClient.spot.findFirst({ where: { id: spotId } }));
    if (!spot) {
        return;
    }
    if (spot.ownerId !== user.id) {
        return res
            .status(403)
            .json({ message: "You do not have permission to modify this spot" });
    }
    const img = await prismaClient_1.prismaClient.spotImage.create({
        data: { url, preview, spotId: spot.id },
    });
    return res.status(201).json({ id: img.id, url, preview });
});
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
router.post("/:spotId/bookings", auth_1.requireAuth, async (req, res, next) => {
    const { startDate: sd, endDate: ed } = req.body;
    const startDate = new Date(sd);
    const endDate = new Date(ed);
    if (startDate >= endDate) {
        return res.status(400).json({
            message: "Bad Request",
            errors: { endDate: "endDate cannot be on or before startDate" },
        });
    }
    const user = req.user;
    const spot = await getSpot(req.params["spotId"], res, (id) => prismaClient_1.prismaClient.spot.findUnique({ where: { id } }));
    if (!spot) {
        return;
    }
    if (spot.ownerId == user.id) {
        return res.status(403).json({
            message: "You own this spot, and cannot make a booking for it",
        });
    }
    let overlap = await (0, validation_1.bookingOverlap)(spot.id, startDate, endDate);
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
        return res.status(403).json(err);
    }
    let booking = await prismaClient_1.prismaClient.booking.create({
        data: {
            userId: user.id,
            spotId: spot.id,
            startDate,
            endDate,
        },
    });
    return res.status(201).json({
        ...booking,
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
    });
});
const getChecks = (0, express_validator_1.checkSchema)({
    page: { isInt: { options: { min: 1, max: 10 } }, optional: true },
    size: { isInt: { options: { min: 1, max: 20 } }, optional: true },
    minLat: { isDecimal: true, optional: true },
    maxLat: { isDecimal: true, optional: true },
    minLng: { isDecimal: true, optional: true },
    maxLng: { isDecimal: true, optional: true },
    minPrice: { isFloat: { options: { min: 0 } }, optional: true },
    maxPrice: { isFloat: { options: { min: 0 } }, optional: true },
}, ["query"]);
router.get("/", getChecks, validation_1.handleValidationErrors, async (req, res) => {
    const { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
    const where = {};
    let parsedSize = 20;
    if (size !== undefined) {
        parsedSize = Number(size);
    }
    let parsedPage = 1;
    if (page !== undefined) {
        parsedPage = Number(page);
    }
    where.lat = {};
    if (minLat !== undefined) {
        where.lat.gte = Number(minLat);
    }
    if (maxLat !== undefined) {
        where.lat.lte = Number(maxLat);
    }
    where.lng = {};
    if (minLng !== undefined) {
        where.lng.gte = Number(minLng);
    }
    if (maxLng !== undefined) {
        where.lng.lte = Number(maxLng);
    }
    where.price = {};
    if (minPrice !== undefined) {
        where.price.gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
        where.price.lte = Number(maxPrice);
    }
    const allSpots = await prismaClient_1.prismaClient.spot.findMany({
        include: {
            images: { where: { preview: true }, select: { url: true } },
            reviews: { select: { stars: true } },
        },
        orderBy: { id: "desc" },
        where,
        skip: parsedSize * (parsedPage - 1),
        take: parsedSize,
    });
    const modspots = allSpots.map(transformSpot);
    res.json({ Spots: modspots, page: parsedPage, size: parsedSize });
});
router.post("/", auth_1.requireAuth, validateNewSpot, async (req, res) => {
    let user = req.user;
    const { address, city, state, country, lat, lng, name, description, price, } = req.body;
    const spot = await prismaClient_1.prismaClient.spot.create({
        data: {
            ownerId: user.id,
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price,
        },
    });
    return res.status(201).json({ ...spot, lat, lng, price });
});
exports.default = router;
//# sourceMappingURL=spots.js.map