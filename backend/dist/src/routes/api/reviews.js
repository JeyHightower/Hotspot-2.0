"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prismaClient_1 = require("../../prismaClient");
const auth_1 = require("../../utils/auth");
const validation_1 = require("../../utils/validation");
const router = (0, express_1.Router)();
router.get("/current", auth_1.requireAuth, async (req, res) => {
    const user = req.user;
    const reviews = await prismaClient_1.prismaClient.review.findMany({
        where: { userId: user.id },
        include: {
            spot: {
                include: {
                    images: { where: { preview: true }, select: { url: true } },
                },
            },
            images: { select: { url: true, id: true } },
            user: { select: { firstName: true, lastName: true } },
        },
    });
    const sequelized = reviews.map((r) => {
        const spot = {
            ...r.spot,
            lat: typeof r.spot.lat === "object"
                ? Number(r.spot.lat.toString())
                : Number(r.spot.lat),
            lng: typeof r.spot.lng === "object"
                ? Number(r.spot.lng.toString())
                : Number(r.spot.lng),
            price: typeof r.spot.price === "object"
                ? Number(r.spot.price.toString())
                : Number(r.spot.price),
            previewImage: r.spot.images?.[0]?.url ?? "",
        };
        return {
            id: r.id,
            userId: r.userId,
            spotId: r.spotId,
            review: r.review,
            stars: r.stars,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            User: {
                id: r.userId,
                firstName: r.user.firstName,
                lastName: r.user.lastName,
            },
            Spot: spot,
            ReviewImages: r.images.map((img) => ({ id: img.id, url: img.url })),
        };
    });
    res.json({ Reviews: sequelized });
});
router.delete("/:reviewId", auth_1.requireAuth, async (req, res) => {
    const reviewId = Number(req.params["reviewId"]);
    if (isNaN(reviewId) || reviewId > 2 ** 31) {
        res.status(404).json({ message: "Review couldn't be found" });
        return;
    }
    const userId = req.user.id;
    try {
        const review = await prismaClient_1.prismaClient.review.findUnique({
            where: {
                id: reviewId,
                userId: userId,
            },
        });
        if (!review) {
            if (!(await prismaClient_1.prismaClient.review.findUnique({ where: { id: reviewId } }))) {
                res.status(404).json({
                    message: "Review couldn't be found",
                });
                return;
            }
            res.status(403).json({
                message: "You are not authorized to delete this review",
            });
            return;
        }
        await prismaClient_1.prismaClient.review.delete({
            where: { id: reviewId },
        });
        res.status(200).json({
            message: "Successfully deleted",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});
const validateReviewImage = [
    (0, express_validator_1.check)("url").isString().withMessage("must pass a url string"),
    validation_1.handleValidationErrors,
];
router.post("/:reviewId/images", auth_1.requireAuth, validateReviewImage, async (req, res) => {
    const user = req.user;
    let reviewId;
    try {
        reviewId = BigInt(req.params["reviewId"]);
        if (BigInt.asIntN(32, reviewId) !== reviewId) {
            throw Error();
        }
    }
    catch (e) {
        res.status(404).json({ message: "Review couldn't be found" });
        return;
    }
    const { url } = req.body;
    const review = await prismaClient_1.prismaClient.review.findFirst({
        where: { id: Number(reviewId) },
        include: { images: true },
    });
    if (review) {
        if (review.userId !== user.id) {
            res
                .status(403)
                .json({ message: "You do not have permission to edit this review" });
            return;
        }
        if (review.images.length >= 10) {
            res.status(403).json({
                message: "Maximum number of images for this resource was reached",
            });
            return;
        }
        let img = await prismaClient_1.prismaClient.reviewImage.create({
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
});
const validateReviewEdit = [
    (0, express_validator_1.check)("review")
        .exists({ values: "falsy" })
        .isString()
        .withMessage("Review text is required"),
    (0, express_validator_1.check)("stars")
        .exists({ values: "falsy" })
        .isInt({ min: 1, max: 5 })
        .withMessage("Stars must be an integer from 1 to 5"),
    validation_1.handleValidationErrors,
];
router.put("/:reviewId", auth_1.requireAuth, validateReviewEdit, async (req, res) => {
    const user = req.user;
    const { review, stars } = req.body;
    let reviewId;
    try {
        reviewId = BigInt(req.params["reviewId"]);
        if (BigInt.asIntN(32, reviewId) !== reviewId) {
            throw Error();
        }
    }
    catch (e) {
        res.status(404).json({ message: "Review couldn't be found" });
        return;
    }
    try {
        const changed = await prismaClient_1.prismaClient.review.update({
            data: {
                review,
                stars,
                updatedAt: new Date(),
            },
            where: { id: Number(reviewId), userId: user.id },
        });
        res.status(200).json(changed);
    }
    catch (e) {
        if (await prismaClient_1.prismaClient.review.findFirst({ where: { id: Number(reviewId) } })) {
            res
                .status(403)
                .json({ message: "You do not have permission to edit this review" });
            return;
        }
        res.status(404).json({ message: "Review couldn't be found" });
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map