import { NextFunction, Request, Response, Router } from "express";

const router = Router();

import { prismaClient } from "../../prisma/prismaClient";
import { requireAuth } from "../../utils/auth";

// ! Delete spot by imageId

router.delete(
  "/spot-images/:imageId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imageId = Number(req.params["imageId"]);

      if (isNaN(imageId)) {
        res.status(404).json({
          message: "Spot Image couldn't be found",
        });
        return;
      }

      const user = req.user!;

      const image = await prisma.spotImage.findUnique({
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

      await prisma.spotImage.delete({
        where: {
          id: imageId,
        },
      });

      res.status(200).json({
        message: "Successfully deleted",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ! delete a review image by imageId

router.delete(
  "/review-images/:imageId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imageId = Number(req.params["imageId"]);

      if (isNaN(imageId)) {
        res.status(404).json({ message: "Review Image couldn't be found" });
        return;
      }

      const userId = req.user!.id;

      const image = await prisma.reviewImage.findUnique({
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

      await prisma.reviewImage.delete({ where: { id: image.id } });

      res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
