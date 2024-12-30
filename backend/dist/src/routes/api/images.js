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
const router = (0, express_1.Router)();
const prismaClient_1 = require("../../prismaClient");
const auth_1 = require("../../utils/auth");
// ! Delete spot by imageId
router.delete("/spot-images/:imageId", auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageId = Number(req.params["imageId"]);
        if (isNaN(imageId)) {
            res.status(404).json({
                message: "Spot Image couldn't be found",
            });
            return;
        }
        const user = req.user;
        const image = yield prismaClient_1.prismaClient.spotImage.findUnique({
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
        yield prismaClient_1.prismaClient.spotImage.delete({
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
}));
// ! delete a review image by imageId
router.delete("/review-images/:imageId", auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageId = Number(req.params["imageId"]);
        if (isNaN(imageId)) {
            res.status(404).json({ message: "Review Image couldn't be found" });
            return;
        }
        const userId = req.user.id;
        const image = yield prismaClient_1.prismaClient.reviewImage.findUnique({
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
        yield prismaClient_1.prismaClient.reviewImage.delete({ where: { id: image.id } });
        res.status(200).json({ message: "Successfully deleted" });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
