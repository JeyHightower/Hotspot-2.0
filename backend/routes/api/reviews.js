"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_js_1 = require("../../utils/validation.js");
const auth_js_1 = require("../../utils/auth.js");
const dbclient_js_1 = require("../../dbclient.js");
const router = (0, express_1.Router)();
const validateReviewImage = [
    (0, express_validator_1.check)('url').isString().withMessage('must pass a url string'),
    validation_js_1.handleValidationErrors,
];
const validateReviewEdit = [
    (0, express_validator_1.check)('review')
        .exists({ checkFalsy: true })
        .isString()
        .withMessage('Review text is required'),
    (0, express_validator_1.check)('stars')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    validation_js_1.handleValidationErrors,
];
router.post('/:reviewId/images', auth_js_1.requireAuth, validateReviewImage, (async (req, res) => {
    const user = req.user;
    let reviewId;
    try {
        reviewId = BigInt(req.params.reviewId);
        if (BigInt.asIntN(32, reviewId) !== reviewId) {
            throw Error();
        }
    }
    catch (e) {
        res.status(404).json({ message: "Review couldn't be found" });
        return;
    }
    const { url } = req.body;
    const review = await dbclient_js_1.prisma.review.findFirst({
        where: { id: Number(reviewId) },
        include: { images: true },
    });
    if (review) {
        if (review.userId !== user.id) {
            res.status(403).json({ message: 'You do not have permission to edit this review' });
            return;
        }
        if (review.images.length >= 10) {
            res.status(403).json({
                message: 'Maximum number of images for this resource was reached',
            });
            return;
        }
        const img = await dbclient_js_1.prisma.reviewImage.create({
            data: {
                reviewId: review.id,
                url: url,
            },
        });
        res.status(201).json({ id: img.id, url });
    }
    else {
        res.status(404).json({ message: "Review couldn't be found" });
    }
}));
router.put('/:reviewId', auth_js_1.requireAuth, validateReviewEdit, (async (req, res) => {
    const user = req.user;
    const { review, stars } = req.body;
    let reviewId;
    try {
        reviewId = BigInt(req.params.reviewId);
        if (BigInt.asIntN(32, reviewId) !== reviewId) {
            throw Error();
        }
    }
    catch (e) {
        res.status(404).json({ message: "Review couldn't be found" });
        return;
    }
    try {
        const changed = await dbclient_js_1.prisma.review.update({
            data: {
                review: review,
                stars: stars,
                updatedAt: new Date(),
            },
            where: { id: Number(reviewId), userId: user.id },
        });
        res.json(changed);
    }
    catch (e) {
        if (await dbclient_js_1.prisma.review.findFirst({ where: { id: Number(reviewId) } })) {
            res.status(403).json({ message: 'You do not have permission to edit this review' });
        }
        else {
            res.status(404).json({ message: "Review couldn't be found" });
        }
    }
}));
router.get('/', (async (req, res) => {
    const reviews = await dbclient_js_1.prisma.review.findMany();
    res.json({ Reviews: reviews });
}));
router.get('/current', auth_js_1.requireAuth, (async (req, res) => {
    const reviews = await dbclient_js_1.prisma.review.findMany({
        where: { userId: req.user.id },
    });
    res.json({ Reviews: reviews });
}));
exports.default = router;
