import { Router } from 'express';
import { requireAuth } from '../../utils/auth.js';
import { prisma } from '../../dbclient.js';
import { sendResponse } from '../../utils/response.js';
const router = Router();
// ! Delete spot by imageId
router.delete('/spot-images/:imageId', requireAuth, async (req, res) => {
    try {
        const imageId = Number(req.params['imageId']);
        if (isNaN(imageId)) {
            res.status(404);
            sendResponse(res, { message: "Spot Image couldn't be found" });
            return;
        }
        const user = req.user;
        const image = await prisma.spotImage.findUnique({
            where: { id: imageId },
            select: { spot: { select: { ownerId: true } } },
        });
        if (image) {
            if (image.spot.ownerId !== user.id) {
                res.status(403);
                sendResponse(res, { message: 'You do not have permission to delete this' });
                return;
            }
            await prisma.spotImage.delete({
                where: { id: imageId },
            });
            sendResponse(res, { message: 'Successfully deleted' });
            return;
        }
        res.status(404);
        sendResponse(res, { message: "Spot Image couldn't be found" });
    }
    catch (error) {
        console.error(error);
        res.status(500);
        sendResponse(res, { error: 'Internal Server Error' });
    }
});
// ! delete a review image by imageId
router.delete('/review-images/:imageId', requireAuth, async (req, res) => {
    const imageId = Number(req.params['imageId']);
    if (isNaN(imageId)) {
        res.status(404);
        sendResponse(res, { message: "Review Image couldn't be found" });
        return;
    }
    const userId = req.user.id;
    const image = await prisma.reviewImage.findUnique({
        where: { id: imageId },
        include: { review: { select: { userId: true } } },
    });
    if (image) {
        if (image.review.userId !== userId) {
            res.status(403);
            sendResponse(res, { message: 'You do not have permission to delete this image' });
            return;
        }
        await prisma.reviewImage.delete({ where: { id: image.id } });
        sendResponse(res, { message: 'Successfully deleted' });
    }
    else {
        res.status(404);
        sendResponse(res, { message: "Review Image couldn't be found" });
    }
});
export default router;
//# sourceMappingURL=images.js.map