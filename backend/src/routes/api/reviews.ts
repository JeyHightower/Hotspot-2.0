import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { handleValidationErrors } from "../../utils/validation.js";
import { prisma } from "../../dbclient.js";
import { requireAuth } from "../../utils/auth.js";

const router = Router();

router.get(
  "/current",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;

    const reviews = await prisma.review.findMany({
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
      const { spot, images, ...rest } = r;

      const {
        images: spotImages,
        lat,
        lng,
        price,
        updatedAt: _u,
        createdAt: _uu,
        ...restSpot
      } = spot;

      const out = {
        User: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        Spot: {
          ...restSpot,
          lat: Number(lat),
          lng: Number(lng),
          price: Number(price),
          previewImage: spotImages[0]?.url ?? "",
        },

        ReviewImages: images,

        ...rest,
      };

      return out;
    });

    res.json({ Reviews: sequelized });
  }
);

router.delete(
  "/:reviewId",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const reviewId = Number(req.params["reviewId"]);
    if (isNaN(reviewId) || reviewId > 2 ** 31) {
      res.status(404).json({ message: "Review couldn't be found" });
      return;
    }

    const userId = req.user!.id;

    try {
      const review = await prisma.review.findUnique({
        where: {
          id: reviewId,
          userId: userId,
        },
      });

      if (!review) {
        if (!(await prisma.review.findUnique({ where: { id: reviewId } }))) {
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

      await prisma.review.delete({
        where: { id: reviewId },
      });
      res.status(200).json({
        message: "Successfully deleted",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

const validateReviewImage = [
  check("url").isString().withMessage("must pass a url string"),

  handleValidationErrors,
];

router.post(
  "/:reviewId/images",
  requireAuth,
  validateReviewImage,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    let reviewId;
    try {
      reviewId = BigInt(req.params["reviewId"]!);

      if (BigInt.asIntN(32, reviewId) !== reviewId) {
        throw Error();
      }
    } catch (e) {
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

      let img = await prisma.reviewImage.create({
        data: {
          reviewId: review.id,
          url,
        },
      });

      res.status(201).json({ id: img.id, url });
    } else {
      res.status(404).json({ message: "Review couldn't be found" });
    }
  }
);

const validateReviewEdit = [
  check("review")
    .exists({ values: "falsy" })
    .isString()
    .withMessage("Review text is required"),
  check("stars")
    .exists({ values: "falsy" })
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),

  handleValidationErrors,
];

router.put(
  "/:reviewId",
  requireAuth,
  validateReviewEdit,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;

    const { review, stars } = req.body;

    let reviewId;
    try {
      reviewId = BigInt(req.params["reviewId"]!);

      if (BigInt.asIntN(32, reviewId) !== reviewId) {
        throw Error();
      }
    } catch (e) {
      res.status(404).json({ message: "Review couldn't be found" });
      return;
    }

    try {
      const changed = await prisma.review.update({
        data: {
          review,
          stars,
          updatedAt: new Date(),
        },
        where: { id: Number(reviewId), userId: user.id },
      });

      res.status(200).json(changed);
    } catch (e) {
      if (await prisma.review.findFirst({ where: { id: Number(reviewId) } })) {
        res
          .status(403)
          .json({ message: "You do not have permission to edit this review" });
        return;
      }

      res.status(404).json({ message: "Review couldn't be found" });
    }
  }
);

export default router;