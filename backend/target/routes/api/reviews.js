import { Router } from 'express';
import { check } from 'express-validator';
import { handleValidationErrors } from '../../utils/validation.js';
import { requireAuth } from '../../utils/auth.js';
import { prisma } from '../../dbclient.js';
const router = Router();
const validateReviewImage = [
    check('url').isString().withMessage('must pass a url string'),
    handleValidationErrors,
];
const validateReviewEdit = [
    check('review')
        .exists({ checkFalsy: true })
        .isString()
        .withMessage('Review text is required'),
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors,
];
router.post('/:reviewId/images', requireAuth, validateReviewImage, (async (req, res) => {
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
    const review = await prisma.review.findFirst({
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
        const img = await prisma.reviewImage.create({
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
router.put('/:reviewId', requireAuth, validateReviewEdit, (async (req, res) => {
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
        const changed = await prisma.review.update({
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
        if (await prisma.review.findFirst({ where: { id: Number(reviewId) } })) {
            res.status(403).json({ message: 'You do not have permission to edit this review' });
        }
        else {
            res.status(404).json({ message: "Review couldn't be found" });
        }
    }
}));
router.get('/', (async (req, res) => {
    const reviews = await prisma.review.findMany();
    res.json({ Reviews: reviews });
}));
router.get('/current', requireAuth, (async (req, res) => {
    const reviews = await prisma.review.findMany({
        where: { userId: req.user.id },
    });
    res.json({ Reviews: reviews });
}));
export default router;
//# sourceMappingURL=reviews.js.map