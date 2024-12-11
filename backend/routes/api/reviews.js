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
router.post('/:reviewId/images', auth_js_1.requireAuth, validateReviewImage, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const review = yield dbclient_js_1.prisma.review.findFirst({
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
        const img = yield dbclient_js_1.prisma.reviewImage.create({
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
})));
router.put('/:reviewId', auth_js_1.requireAuth, validateReviewEdit, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const changed = yield dbclient_js_1.prisma.review.update({
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
        if (yield dbclient_js_1.prisma.review.findFirst({ where: { id: Number(reviewId) } })) {
            res.status(403).json({ message: 'You do not have permission to edit this review' });
        }
        else {
            res.status(404).json({ message: "Review couldn't be found" });
        }
    }
})));
router.get('/', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield dbclient_js_1.prisma.review.findMany();
    res.json({ Reviews: reviews });
})));
router.get('/current', auth_js_1.requireAuth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield dbclient_js_1.prisma.review.findMany({
        where: { userId: req.user.id },
    });
    res.json({ Reviews: reviews });
})));
exports.default = router;
