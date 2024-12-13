import { Router } from 'express';
import { prisma } from '../../dbclient.js';
import { requireAuth } from '../../utils/auth.js';
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
const router = Router();
// ! Delete spot by imageId
router.delete('/spot-images/:imageId', requireAuth, async (req, res, next) => {
    try {
        const imageId = Number(req.params['imageId']);
        if (isNaN(imageId)) {
            return res.status(404).json({
                message: "Spot Image couldn't be found",
            });
        }
        const user = req.user;
        const image = await prisma.spotImage.findUnique({
            where: { id: imageId },
            select: { spot: { select: { ownerId: true } } },
        });
        if (image) {
            if (image.spot.ownerId !== user.id) {
                return res
                    .status(403)
                    .json({ message: 'You do not have permission to delete this' });
            }
            await prisma.spotImage.delete({
                where: {
                    id: imageId,
                },
            });
            return res.status(200).json({
                message: 'Successfully deleted',
            });
        }
        return res.status(404).json({
            message: "Spot Image couldn't be found",
        });
    }
    catch (error) {
        next(error);
    }
}); // ! delete a review image by imageId
router.delete('/review-images/:imageId', requireAuth, async (req, res) => {
    const imageId = Number(req.params['imageId']);
    if (isNaN(imageId)) {
        return res.status(404).json({ message: "Review Image couldn't be found" });
    }
    const userId = req.user.id;
    const image = await prisma.reviewImage.findUnique({
        where: { id: imageId },
        include: { review: { select: { userId: true } } },
    });
    if (image) {
        if (image.review.userId !== userId) {
            return res
                .status(403)
                .json({ message: 'You do not have permission to delete this image' });
        }
        await prisma.reviewImage.delete({ where: { id: image.id } });
        return res.status(200).json({ message: `Successfully deleted` });
    }
    else {
        return res.status(404).json({ message: "Review Image couldn't be found" });
    }
});
export default router;