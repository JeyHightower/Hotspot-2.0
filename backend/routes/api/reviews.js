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
const validation_js_1 = require("../../utils/validation.js");
const express_validator_1 = require("express-validator");
const auth_js_1 = require("../../utils/auth.js");
const dbclient_js_1 = require("../../dbclient.js");
const response_js_1 = require("../../utils/response.js");
const router = (0, express_1.Router)();
router.get('/current', auth_js_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const reviews = yield dbclient_js_1.prisma.review.findMany({
        where: { userId: user.id },
        include: {
            spot: {
                include: {
                    images: { where: { preview: true }, select: { url: true } },
                },
            },
            images: { select: { url: true, id: true } },
        },
    });
    const sequelized = reviews.map((r) => {
        var _a, _b;
        const { spot, images } = r, rest = __rest(r, ["spot", "images"]);
        const { images: spotImages, lat, lng, price, updatedAt: _u, createdAt: _uu } = spot, restSpot = __rest(spot, ["images", "lat", "lng", "price", "updatedAt", "createdAt"]);
        const out = Object.assign({ User: { id: user.id, firstName: user.firstName, lastName: user.lastName }, Spot: Object.assign(Object.assign({}, restSpot), { lat: Number(lat), lng: Number(lng), price: Number(price), previewImage: (_b = (_a = spotImages[0]) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : '' }), ReviewImages: images }, rest);
        return out;
    });
    (0, response_js_1.sendResponse)(res, { Reviews: sequelized });
}));
router.delete('/:reviewId', auth_js_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewId = Number(req.params['reviewId']);
    if (isNaN(reviewId) || reviewId > 2 ** 31) {
        res.status(404);
        (0, response_js_1.sendResponse)(res, { message: "Review couldn't be found" });
        return;
    }
    const userId = req.user.id;
    try {
        const review = yield dbclient_js_1.prisma.review.findUnique({
            where: {
                id: reviewId,
                userId: userId,
            },
        });
        if (!review) {
            if (!(yield dbclient_js_1.prisma.review.findUnique({ where: { id: reviewId } }))) {
                res.status(404);
                (0, response_js_1.sendResponse)(res, { message: "Review couldn't be found" });
                return;
            }
            res.status(403);
            (0, response_js_1.sendResponse)(res, { message: 'You are not authorized to delete this review' });
            return;
        }
        yield dbclient_js_1.prisma.review.delete({
            where: { id: reviewId },
        });
        (0, response_js_1.sendResponse)(res, { message: 'Successfully deleted' });
    }
    catch (error) {
        res.status(500);
        (0, response_js_1.sendResponse)(res, { message: 'Internal Server Error' });
    }
}));
const validateReviewImage = [
    (0, express_validator_1.check)('url').isString().withMessage('must pass a url string'),
    validation_js_1.handleValidationErrors,
];
router.post('/:reviewId/images', auth_js_1.requireAuth, validateReviewImage, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let reviewId;
    try {
        reviewId = BigInt(req.params['reviewId']);
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
        let img = yield dbclient_js_1.prisma.reviewImage.create({
            data: {
                reviewId: review.id,
                url,
            },
        });
        res.status(201).json({ id: img.id, url });
    }
    else {
        res.status(404).json({ message: "Review couldn't be found" });
    }
}));
const validateReviewEdit = [
    (0, express_validator_1.check)('review')
        .exists({ values: 'falsy' })
        .isString()
        .withMessage('Review text is required'),
    (0, express_validator_1.check)('stars')
        .exists({ values: 'falsy' })
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    validation_js_1.handleValidationErrors,
];
router.put('/:reviewId', auth_js_1.requireAuth, validateReviewEdit, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { review, stars } = req.body;
    let reviewId;
    try {
        reviewId = BigInt(req.params['reviewId']);
        if (BigInt.asIntN(32, reviewId) !== reviewId) {
            throw Error();
        }
    }
    catch (e) {
        return res.status(404).json({ message: "Review couldn't be found" });
    }
    try {
        const changed = yield dbclient_js_1.prisma.review.update({
            data: {
                review,
                stars,
                updatedAt: new Date(),
            },
            where: { id: Number(reviewId), userId: user.id },
        });
        return res.status(200).json(changed);
    }
    catch (e) {
        if (yield dbclient_js_1.prisma.review.findFirst({ where: { id: Number(reviewId) } })) {
            return res
                .status(403)
                .json({ message: 'You do not have permission to edit this review' });
        }
        return res.status(404).json({ message: "Review couldn't be found" });
    }
}));
exports.default = router;
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // existing code
}));
router.post('/:spotId/reviews', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // existing code
}));
