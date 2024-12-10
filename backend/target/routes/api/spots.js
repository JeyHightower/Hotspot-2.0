import { Router } from 'express';
import { check } from 'express-validator';
import { prisma } from '../../dbclient.js';
import { requireAuth } from '../../utils/auth.js';
import { generateRandomSpot } from '../../utils/generators.js';
import { sendResponse } from '../../utils/response.js';
import { bookingOverlap, handleValidationErrors, parseI32, } from '../../utils/validation.js';
const router = Router();
async function getSpot(id, res, cb) {
    let spotId = parseSpotId(id, res);
    if (spotId) {
        let data = await cb(spotId);
        if (data) {
            return data;
        }
        res.status(404);
        sendResponse(res, { message: "Spot couldn't be found" });
        return null;
    }
    return null;
}
function transformSpot(wholeSpot) {
    const { images, reviews, lat, lng, price, ...spot } = wholeSpot;
    return {
        ...spot,
        lat: Number(lat),
        lng: Number(lng),
        price: Number(price),
        previewImage: images[0]?.url ?? '',
        avgRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length || 0,
    };
}
function parseSpotId(spotId, res) {
    const id = parseI32(spotId);
    if (id !== null) {
        return id;
    }
    res.status(404);
    sendResponse(res, { message: "Spot couldn't be found" });
    return null;
}
function formatDate(d) {
    return d.toISOString().split('T')[0];
}
router.get('/current', requireAuth, async (req, res) => {
    const allSpots = await prisma.spot.findMany({
        where: { ownerId: req.user.id },
        include: {
            images: { where: { preview: true }, select: { url: true } },
            reviews: { select: { stars: true } },
        },
    });
    sendResponse(res, { Spots: allSpots.map(transformSpot) });
});
const validateNewSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true }).withMessage('City is required'),
    check('state').exists({ checkFalsy: true }).withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage('Price per day is required'),
    handleValidationErrors,
];
router.get('/:spotId', async (req, res) => {
    const spot = await getSpot(req.params['spotId'], res, (spotId) => prisma.spot.findFirst({
        where: { id: spotId },
        include: {
            images: { select: { id: true, url: true, preview: true } },
            reviews: { select: { stars: true } },
            owner: { select: { id: true, firstName: true, lastName: true } },
        },
    }));
    if (!spot)
        return;
    const { reviews, images, owner, ...rest } = spot;
    sendResponse(res, {
        ...rest,
        numReviews: reviews.length,
        avgStarRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length || 0,
        SpotImages: images,
        Owner: owner,
    });
});
router.put('/:spotId', requireAuth, validateNewSpot, async (req, res) => {
    const user = req.user;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const spot = await getSpot(req.params['spotId'], res, (id) => prisma.spot.findUnique({ where: { id } }));
    if (!spot)
        return;
    if (spot.ownerId !== user.id) {
        res.status(403);
        sendResponse(res, {
            message: 'You do not have permission to edit this spot',
        });
        return;
    }
    const updated = await prisma.spot.update({
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
    sendResponse(res, { ...updated, lat, lng, price });
});
// Continue with remaining routes...
// ... (previous code remains the same)
router.delete('/:spotId', requireAuth, async (req, res) => {
    const user = req.user;
    const spot = await getSpot(req.params['spotId'], res, (spotId) => prisma.spot.findFirst({
        where: { id: spotId },
        select: { id: true, ownerId: true },
    }));
    if (!spot)
        return;
    if (spot.ownerId !== user.id) {
        res.status(403);
        sendResponse(res, {
            message: 'You do not have permission to delete this spot',
        });
        return;
    }
    await prisma.spot.delete({ where: { id: spot.id } });
    sendResponse(res, { message: 'Successfully deleted' });
});
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const user = req.user;
    const spot = await getSpot(req.params['spotId'], res, (id) => prisma.spot.findUnique({ where: { id } }));
    if (!spot)
        return;
    if (spot.ownerId == user.id) {
        const bookings = await prisma.booking.findMany({
            where: { spotId: spot.id },
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
        sendResponse(res, { Bookings: sequelized });
    }
    else {
        const bookings = await prisma.booking.findMany({
            where: { spotId: spot.id, userId: user.id },
            select: { startDate: true, endDate: true, spotId: true },
        });
        sendResponse(res, { Bookings: bookings });
    }
});
router.get('/:spotId/reviews', async (req, res) => {
    const spot = await getSpot(req.params.spotId, res, (id) => prisma.spot.findUnique({ where: { id } }));
    if (!spot)
        return;
    const reviews = await prisma.review.findMany({
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
    sendResponse(res, { Reviews: out });
});
const validateNewReview = [
    check('review')
        .exists({ checkFalsy: true })
        .isString()
        .withMessage('Review text is required'),
    check('stars').exists({ checkFalsy: true }).isInt({ min: 1, max: 5 }),
    handleValidationErrors,
];
router.post('/:spotId/reviews', requireAuth, validateNewReview, async (req, res) => {
    const user = req.user;
    const { review, stars } = req.body;
    const spot = await getSpot(req.params['spotId'], res, (spotId) => prisma.spot.findFirst({
        where: { id: spotId },
        include: { reviews: { where: { userId: user.id } } },
    }));
    if (!spot)
        return;
    if (spot.reviews.length) {
        res.status(500);
        sendResponse(res, { message: 'User already has a review for this spot' });
        return;
    }
    const rev = await prisma.review.create({
        data: {
            userId: user.id,
            spotId: spot.id,
            review: String(review),
            stars: Number(stars),
        },
    });
    res.status(201);
    sendResponse(res, rev);
});
// ... continuing in next response due to length
// ... (previous code remains the same)
router.post('/generate-random', requireAuth, async (req, res) => {
    const count = req.body.count || 1;
    const spots = [];
    for (let i = 0; i < count; i++) {
        const randomSpot = generateRandomSpot();
        const spot = await prisma.spot.create({
            data: {
                ...randomSpot,
                ownerId: req.user.id,
                city: randomSpot.city || '',
                state: randomSpot.state || '',
                images: {
                    create: randomSpot.images
                        .filter((url) => url !== undefined)
                        .map((url) => ({
                        url,
                        preview: true,
                    })),
                },
            },
        });
        spots.push(spot);
    }
    sendResponse(res, { spots });
});
const validateNewSpotImage = [
    check('url').exists({ checkFalsy: true }).withMessage('URL is required'),
    check('preview')
        .exists({ checkFalsy: true })
        .isBoolean()
        .withMessage('Preview flag is required'),
    handleValidationErrors,
];
router.post('/:spotId/images', requireAuth, validateNewSpotImage, async (req, res) => {
    const user = req.user;
    const { url, preview } = req.body;
    let spot = await getSpot(req.params['spotId'], res, (spotId) => prisma.spot.findFirst({ where: { id: spotId } }));
    if (!spot)
        return;
    if (spot.ownerId !== user.id) {
        res.status(403);
        sendResponse(res, {
            message: 'You do not have permission to modify this spot',
        });
        return;
    }
    const img = await prisma.spotImage.create({
        data: { url, preview, spotId: spot.id },
    });
    res.status(201);
    sendResponse(res, { id: img.id, url, preview });
});
router.post('/:spotId/bookings', requireAuth, async (req, res) => {
    const { startDate: sd, endDate: ed } = req.body;
    const startDate = new Date(sd);
    const endDate = new Date(ed);
    if (startDate >= endDate) {
        res.status(400);
        sendResponse(res, {
            message: 'Bad Request',
            errors: { endDate: 'endDate cannot be on or before startDate' },
        });
        return;
    }
    const user = req.user;
    const spot = await getSpot(req.params['spotId'], res, (id) => prisma.spot.findUnique({ where: { id } }));
    if (!spot)
        return;
    if (spot.ownerId == user.id) {
        res.status(403);
        sendResponse(res, {
            message: 'You own this spot, and cannot make a booking for it',
        });
        return;
    }
    let overlap = await bookingOverlap(spot.id, startDate, endDate);
    if (overlap) {
        let err = {
            message: 'Sorry, this spot is already booked for the specified dates',
            errors: {},
        };
        if (overlap.startDate <= startDate && startDate <= overlap.endDate) {
            err.errors.startDate = 'Start date conflicts with an existing booking';
        }
        if (overlap.startDate <= endDate && endDate <= overlap.endDate) {
            err.errors.endDate = 'End date conflicts with an existing booking';
        }
        res.status(403);
        sendResponse(res, err);
        return;
    }
});
router.get('/', getChecks, handleValidationErrors, async (req, res) => {
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
    const allSpots = await prisma.spot.findMany({
        include: {
            images: { where: { preview: true }, select: { url: true } },
            reviews: { select: { stars: true } },
        },
        orderBy: { id: 'asc' },
        where,
        skip: parsedSize * (parsedPage - 1),
        take: parsedSize,
    });
    const modspots = allSpots.map(transformSpot);
    sendResponse(res, { Spots: modspots, page: parsedPage, size: parsedSize });
});
export default router;
//# sourceMappingURL=spots.js.map