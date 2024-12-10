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
const response_js_1 = require("../../utils/response.js");
const router = (0, express_1.Router)();
// ! Delete spot by imageId
router.delete('/spot-images/:imageId', auth_js_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageId = Number(req.params['imageId']);
        if (isNaN(imageId)) {
            res.status(404);
            (0, response_js_1.sendResponse)(res, { message: "Spot Image couldn't be found" });
            return;
        }
        const user = req.user;
        const image = yield dbclient_js_1.prisma.spotImage.findUnique({
            where: { id: imageId },
            select: { spot: { select: { ownerId: true } } },
        });
        if (image) {
            if (image.spot.ownerId !== user.id) {
                res.status(403);
                (0, response_js_1.sendResponse)(res, { message: 'You do not have permission to delete this' });
                return;
            }
            yield dbclient_js_1.prisma.spotImage.delete({
                where: { id: imageId },
            });
            (0, response_js_1.sendResponse)(res, { message: 'Successfully deleted' });
            return;
        }
        res.status(404);
        (0, response_js_1.sendResponse)(res, { message: "Spot Image couldn't be found" });
    }
    catch (error) {
        console.error(error);
        res.status(500);
        (0, response_js_1.sendResponse)(res, { error: 'Internal Server Error' });
    }
}));
// ! delete a review image by imageId
router.delete('/review-images/:imageId', auth_js_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = Number(req.params['imageId']);
    if (isNaN(imageId)) {
        res.status(404);
        (0, response_js_1.sendResponse)(res, { message: "Review Image couldn't be found" });
        return;
    }
    const userId = req.user.id;
    const image = yield dbclient_js_1.prisma.reviewImage.findUnique({
        where: { id: imageId },
        include: { review: { select: { userId: true } } },
    });
    if (image) {
        if (image.review.userId !== userId) {
            res.status(403);
            (0, response_js_1.sendResponse)(res, { message: 'You do not have permission to delete this image' });
            return;
        }
        yield dbclient_js_1.prisma.reviewImage.delete({ where: { id: image.id } });
        (0, response_js_1.sendResponse)(res, { message: 'Successfully deleted' });
    }
    else {
        res.status(404);
        (0, response_js_1.sendResponse)(res, { message: "Review Image couldn't be found" });
    }
}));
exports.default = router;
