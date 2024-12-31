"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const prismaClient_1 = require("../../prismaClient");
const auth_1 = require("../../utils/auth");
// ! Delete spot by imageId
router.delete("/spot-images/:imageId", auth_1.requireAuth, async (req, res, next) => {
    try {
        const imageId = Number(req.params["imageId"]);
        if (isNaN(imageId)) {
            res.status(404).json({
                message: "Spot Image couldn't be found",
            });
            return;
        }
        const user = req.user;
        const image = await prismaClient_1.prismaClient.spotImage.findUnique({
            where: { id: imageId },
            select: { spot: { select: { ownerId: true } } },
        });
        if (!image) {
            res.status(404).json({
                message: "Spot Image couldn't be found",
            });
            return;
        }
        if (image.spot.ownerId !== user.id) {
            res
                .status(403)
                .json({ message: "You do not have permission to delete this" });
            return;
        }
        await prismaClient_1.prismaClient.spotImage.delete({
            where: {
                id: imageId,
            },
        });
        res.status(200).json({
            message: "Successfully deleted",
        });
    }
    catch (error) {
        next(error);
    }
});
// ! delete a review image by imageId
router.delete("/review-images/:imageId", auth_1.requireAuth, async (req, res, next) => {
    try {
        const imageId = Number(req.params["imageId"]);
        if (isNaN(imageId)) {
            res.status(404).json({ message: "Review Image couldn't be found" });
            return;
        }
        const userId = req.user.id;
        const image = await prismaClient_1.prismaClient.reviewImage.findUnique({
            where: { id: imageId },
            include: { review: { select: { userId: true } } },
        });
        if (!image) {
            res.status(404).json({ message: "Review Image couldn't be found" });
            return;
        }
        if (image.review.userId !== userId) {
            res
                .status(403)
                .json({ message: "You do not have permission to delete this image" });
            return;
        }
        await prismaClient_1.prismaClient.reviewImage.delete({ where: { id: image.id } });
        res.status(200).json({ message: "Successfully deleted" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=images.js.map