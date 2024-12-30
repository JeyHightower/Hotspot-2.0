import { Spot } from "@prisma/client";
import { Request, RequestHandler, Response, Router } from "express";
import { check } from "express-validator";
import { prismaClient as prisma } from "../../prismaClient";
import { requireAuth } from "../../utils/auth";
import { handleValidationErrors } from "../../utils/validation";

const router = Router();

interface SpotWithRelations extends Spot {
  reviews: { stars: number }[];
  images: { url: string; preview?: boolean }[];
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

async function getSpot<T>(
  id: string | undefined,
  res: Response,
  cb: (id: number) => Promise<T | null>
): Promise<T | null> {
  const spotId = parseSpotId(id, res);
  if (spotId === null) return null;

  const data = await cb(spotId);
  if (data) return data;

  res.status(404).json({ message: "Spot couldn't be found" });
  return null;
}

function transformSpot(spot: SpotWithRelations): object {
  const { images, reviews, lat, lng, price, ...rest } = spot;
  return {
    ...rest,
    lat: Number(lat),
    lng: Number(lng),
    price: Number(price),
    previewImage: images[0]?.url ?? "",
    avgRating: reviews.length
      ? reviews.reduce((a, i) => a + i.stars, 0) / reviews.length
      : 0,
  };
}

function parseSpotId(spotId: string | undefined, res: Response): number | null {
  if (!spotId) {
    res.status(404).json({ message: "Spot couldn't be found" });
    return null;
  }

  const id = parseInt(spotId, 10);
  if (isNaN(id)) {
    res.status(404).json({ message: "Spot couldn't be found" });
    return null;
  }

  return id;
}

router.get("/current", requireAuth, async (req: Request, res: Response) => {
  console.log(req.user)
  const allSpots = await prisma.spot.findMany({
    where: { ownerId: req.user!.id },
    include: {
      images: { where: { preview: true }, select: { url: true } },
      reviews: { select: { stars: true } },
    },
  });

  res.json({
    Spots: allSpots.map((spot) => transformSpot(spot as SpotWithRelations)),
  });
});

const validateNewSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("lat")
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage("Latitude is not valid"),
  check("lng")
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage("Longitude is not valid"),
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage("Price per day is required"),
  handleValidationErrors,
];

const getSpotById: RequestHandler = async (req, res) => {
  const spot = await getSpot(req.params.spotId, res, (spotId) =>
    prisma.spot.findUnique({
      where: { id: spotId },
      include: {
        images: { select: { id: true, url: true, preview: true } },
        reviews: { select: { stars: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    })
  );

  if (!spot) {
    res.status(404).json({ message: "Spot couldn't be found" });
    return;
  }

  const { reviews, images, owner, ...rest } = spot as SpotWithRelations;
  res.json({
    ...rest,
    numReviews: reviews.length,
    avgStarRating: reviews.length
      ? reviews.reduce((a, i) => a + i.stars, 0) / reviews.length
      : 0,
    SpotImages: images,
    Owner: owner,
  });
};

router.get("/:spotId", getSpotById);

// Create a new spot
router.post(
  "/",
  requireAuth,
  validateNewSpot,
  async (req: Request, res: Response) => {
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    try {
      const spot = await prisma.spot.create({
        data: {
          ownerId: req.user!.id,
          address,
          city,
          state,
          country,
          lat,
          lng,
          name,
          description,
          price,
        },
      });

      res.status(201).json(spot);
    } catch (error) {
      res.status(400).json({
        message: "Failed to create spot",
        errors: { error: "An unexpected error occurred" },
      });
    }
  }
);

// Edit a spot
router.put(
  "/:spotId",
  requireAuth,
  validateNewSpot,
  async (req: Request, res: Response) => {
    const user = req.user!;
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } })
    );

    if (!spot) return;

    if (spot.ownerId !== user.id) {
      return res.status(403).json({
        message: "You do not have permission to edit this spot",
      });
    }

    const updated = await prisma.spot.update({
      where: { id: spot.id },
      data: {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
        updatedAt: new Date(),
      },
    });

    res.json(updated);
  }
);

// Delete a spot
router.delete("/:spotId", requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  const spot = await getSpot(req.params.spotId, res, (spotId) =>
    prisma.spot.findUnique({
      where: { id: spotId },
      select: { id: true, ownerId: true },
    })
  );

  if (!spot) return;

  if (spot.ownerId !== user.id) {
    return res.status(403).json({
      message: "You do not have permission to delete this spot",
    });
  }

  await prisma.spot.delete({ where: { id: spot.id } });
  res.json({ message: "Successfully deleted" });
});

// Get all bookings for a spot
router.get(
  "/:spotId/bookings",
  requireAuth,
  async (req: Request, res: Response) => {
    const user = req.user!;
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } })
    );

    if (!spot) return;

    if (spot.ownerId === user.id) {
      const bookings = await prisma.booking.findMany({
        where: { spotId: spot.id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      res.json({
        Bookings: bookings.map(({ user, ...booking }) => ({
          ...booking,
          User: user,
        })),
      });
    } else {
      const bookings = await prisma.booking.findMany({
        where: { spotId: spot.id },
        select: { startDate: true, endDate: true, spotId: true },
      });
      res.json({ Bookings: bookings });
    }
  }
);

// Get all reviews for a spot
router.get("/:spotId/reviews", async (req: Request, res: Response) => {
  const spot = await getSpot(req.params.spotId, res, (id) =>
    prisma.spot.findUnique({ where: { id } })
  );

  if (!spot) return;

  const reviews = await prisma.review.findMany({
    where: { spotId: spot.id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      images: { select: { id: true, url: true } },
    },
  });

  res.json({
    Reviews: reviews.map(({ user, images, ...review }) => ({
      ...review,
      User: user,
      ReviewImages: images,
    })),
  });
});

// Create a review for a spot
const validateNewReview = [
  check("review")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be between 1 and 5"),
  handleValidationErrors,
];

router.post(
  "/:spotId/reviews",
  requireAuth,
  validateNewReview,
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { review, stars } = req.body;

    const spot = await getSpot(req.params.spotId, res, (spotId) =>
      prisma.spot.findFirst({
        where: { id: spotId },
        include: { reviews: { where: { userId: user.id } } },
      })
    );

    if (!spot) return;

    if (spot.reviews.length) {
      return res.status(403).json({
        message: "User already has a review for this spot",
      });
    }

    const newReview = await prisma.review.create({
      data: {
        userId: user.id,
        spotId: spot.id,
        review: String(review),
        stars: Number(stars),
      },
    });

    res.status(201).json(newReview);
  }
);

// Add an image to a spot
const validateNewSpotImage = [
  check("url").exists({ checkFalsy: true }).withMessage("URL is required"),
  check("preview")
    .exists({ checkFalsy: true })
    .isBoolean()
    .withMessage("Preview flag is required"),
  handleValidationErrors,
];

router.post(
  "/:spotId/images",
  requireAuth,
  validateNewSpotImage,
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { url, preview } = req.body;

    const spot = await getSpot(req.params.spotId, res, (spotId) =>
      prisma.spot.findUnique({ where: { id: spotId } })
    );

    if (!spot) return;

    if (spot.ownerId !== user.id) {
      return res.status(403).json({
        message: "You do not have permission to modify this spot",
      });
    }

    const image = await prisma.spotImage.create({
      data: { url, preview, spotId: spot.id },
    });

    res.status(201).json({
      id: image.id,
      url,
      preview,
    });
  }
);

// Create a booking for a spot
router.post(
  "/:spotId/bookings",
  requireAuth,
  async (req: Request, res: Response) => {
    const { startDate: startDateStr, endDate: endDateStr } = req.body;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "Bad Request",
        errors: { endDate: "endDate cannot be on or before startDate" },
      });
    }

    const user = req.user!;
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } })
    );

    if (!spot) return;

    if (spot.ownerId === user.id) {
      return res.status(403).json({
        message: "You own this spot, and cannot make a booking for it",
      });
    }

    // Check for booking conflicts
    const existingBooking = await prisma.booking.findFirst({
      where: {
        spotId: spot.id,
        OR: [
          {
            startDate: { lte: startDate },
            endDate: { gte: startDate },
          },
          {
            startDate: { lte: endDate },
            endDate: { gte: endDate },
          },
        ],
      },
    });

    if (existingBooking) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        spotId: spot.id,
        userId: user.id,
        startDate,
        endDate,
      },
    });

    res.status(201).json(booking);
  }
);

// Get all spots with filtering
router.get("/", async (req: Request, res: Response) => {
  const {
    page = "1",
    size = "20",
    minLat,
    maxLat,
    minLng,
    maxLng,
    minPrice,
    maxPrice,
  } = req.query;

  const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
  const parsedSize = Math.max(
    1,
    Math.min(20, parseInt(size as string, 10) || 20)
  );

  const where: any = {};

  if (minLat || maxLat) {
    where.lat = {};
    if (minLat) where.lat.gte = parseFloat(minLat as string);
    if (maxLat) where.lat.lte = parseFloat(maxLat as string);
  }

  if (minLng || maxLng) {
    where.lng = {};
    if (minLng) where.lng.gte = parseFloat(minLng as string);
    if (maxLng) where.lng.lte = parseFloat(maxLng as string);
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice as string);
    if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
  }

  const spots = await prisma.spot.findMany({
    where,
    include: {
      images: { where: { preview: true }, select: { url: true } },
      reviews: { select: { stars: true } },
    },
    take: parsedSize,
    skip: (parsedPage - 1) * parsedSize,
  });

  res.json({
    Spots: spots.map((spot) => transformSpot(spot as SpotWithRelations)),
    page: parsedPage,
    size: parsedSize,
  });
});

export default router;
