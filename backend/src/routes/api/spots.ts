import { Decimal } from "@prisma/client/runtime/library";
import { Request, Response, Router } from "express";
import { check, checkSchema } from "express-validator";
import {
  bookingOverlap,
  handleValidationErrors,
  parseI32,
} from "../../utils/validation.js";

import { prisma } from "../../dbclient.js";
import { requireAuth } from "../../utils/auth.js";

interface SpotType {
  id: number;
  ownerId: number;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number | string | Decimal;
  lng: number | string | Decimal;
  name: string;
  description: string;
  price: number | string | Decimal;
  createdAt: Date;
  updatedAt: Date;
}

interface SpotWithRelations extends SpotType {
  reviews: Array<{ stars: number }>;
  images: Array<{ url: string }>;
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const validateNewReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

const router = Router();

function transformSpot(wholeSpot: any): object {
  const { images, reviews, ...spot } = wholeSpot;

  const lat = typeof spot.lat === 'object' ? Number(spot.lat.toString()) : Number(spot.lat);
  const lng = typeof spot.lng === 'object' ? Number(spot.lng.toString()) : Number(spot.lng);
  const price = typeof spot.price === 'object' ? Number(spot.price.toString()) : Number(spot.price);

  return {
    ...spot,
    lat,
    lng,
    price,
    previewImage: images?.[0]?.url ?? "",
    avgRating: reviews?.length 
      ? reviews.reduce((a: number, i: { stars: number }) => a + i.stars, 0) / reviews.length 
      : 0,
  };
}

function parseSpotId(spotId: string | undefined, res: Response): number | null {
  const id = parseI32(spotId);

  if (id !== null) {
    return id;
  } else {
    res.status(404).json({ message: "Spot couldn't be found" });
    return null;
  }
}

async function getSpot<T = any>(
  id: string | undefined,
  res: Response,
  cb: (id: number) => Promise<T | null>
): Promise<T | null> {
  const spotId = parseSpotId(id, res);

  if (!spotId) {
    return null;
  }

  const data = await cb(spotId);

  if (!data) {
    res.status(404).json({ message: "Spot couldn't be found" });
    return null;
  }

  return data;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

router.get(
  "/current",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const allSpots = await prisma.spot.findMany({
      where: { ownerId: req.user!.id },
      include: {
        images: { 
          where: { preview: true }, 
          select: { url: true } 
        },
        reviews: { select: { stars: true } },
      },
    });

    const modspots = allSpots.map((spot: SpotWithRelations) => ({
      ...transformSpot(spot),
      previewImage: spot.images[0]?.url || ""
    }));

    res.json({ 
      Spots: modspots
    });
  }
);

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

router.get("/:spotId", async (req: Request, res: Response): Promise<void> => {
  const spot = await getSpot(req.params.spotId, res, (spotId) =>
    prisma.spot.findUnique({
      where: { id: spotId },
      include: {
        reviews: {
          select: { stars: true }
        },
        images: {
          select: { url: true }
        },
        owner: {
          select: { 
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  );

  if (!spot) {
    return;
  }

  const { reviews, images, owner, ...rest } = spot as SpotWithRelations;
  const lat = typeof rest.lat === 'object' ? Number(rest.lat.toString()) : Number(rest.lat);
  const lng = typeof rest.lng === 'object' ? Number(rest.lng.toString()) : Number(rest.lng);
  const price = typeof rest.price === 'object' ? Number(rest.price.toString()) : Number(rest.price);

  res.json({
    ...rest,
    lat,
    lng,
    price,
    numReviews: reviews.length,
    avgStarRating: reviews.length
      ? reviews.reduce((a: number, i: { stars: number }) => a + i.stars, 0) / reviews.length
      : 0,
    SpotImages: images,
    Owner: owner,
  });
});

router.put(
  "/:spotId",
  requireAuth,
  validateNewSpot,
  async (req: Request, res: Response): Promise<void> => {
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
      prisma.spot.findUnique({
        where: { id },
        select: { id: true, ownerId: true }
      })
    );

    if (!spot) return;

    if (spot.ownerId !== user.id) {
      res.status(403).json({ 
        message: "You do not have permission to edit this spot" 
      });
      return;
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

    // Convert Decimal types to numbers for response
    const response = {
      ...updated,
      lat: Number(updated.lat),
      lng: Number(updated.lng),
      price: Number(updated.price)
    };

    res.json(response);
  }
);

router.delete(
  "/:spotId",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;

    const spot = await getSpot(req.params.spotId, res, (spotId) =>
      prisma.spot.findFirst({
        where: { id: spotId },
        select: { id: true, ownerId: true },
      })
    );

    if (!spot) return;

    if (spot.ownerId !== user.id) {
      res.status(403).json({ 
        message: "You do not have permission to delete this spot" 
      });
      return;
    }

    await prisma.spot.delete({ where: { id: spot.id } });
    res.json({ message: "Successfully deleted" });
  }
);

// GET /spots/:spotId/bookings
router.get(
  "/:spotId/bookings",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;

    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({
        where: { id },
        select: { id: true, ownerId: true }
      })
    );

    if (!spot) return;

    if (spot.ownerId === user.id) {
      const bookings = await prisma.booking.findMany({
        where: { spotId: spot.id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      const formattedBookings = bookings.map((booking: { 
        user: { id: number; firstName: string; lastName: string };
        id: number;
        spotId: number;
        userId: number;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        User: booking.user,
        id: booking.id,
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }));

      res.json({ Bookings: formattedBookings });
    } else {
      const bookings = await prisma.booking.findMany({
        where: { 
          spotId: spot.id,
          userId: user.id 
        },
        select: {
          spotId: true,
          startDate: true,
          endDate: true
        }
      });

      const formattedBookings = bookings.map((booking: { spotId: number; startDate: Date; endDate: Date }) => ({
        spotId: booking.spotId,
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate)
      }));

      res.json({ Bookings: formattedBookings });
    }
  }
);

// GET /spots/:spotId/reviews
router.get(
  "/:spotId/reviews",
  async (req: Request, res: Response): Promise<void> => {
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({
        where: { id },
        select: { id: true }
      })
    );

    if (!spot) return;

    const reviews = await prisma.review.findMany({
      where: { spotId: spot.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        images: {
          select: {
            id: true,
            url: true
          }
        }
      }
    });

    res.json({ Reviews: reviews });
  }
);



router.post(
  "/:spotId/reviews",
  requireAuth,
  validateNewReview,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    const { review, stars } = req.body;

    const spot = await getSpot(req.params["spotId"], res, (spotId) =>
      prisma.spot.findFirst({
        where: { id: spotId },
        include: { reviews: { where: { userId: user.id } } },
      })
    );

    if (!spot) {
      return;
    }

    if (spot.reviews.length) {
      res
        .status(500)
        .json({ message: "User already has a review for this spot" });
      return;
    }

    const rev = await prisma.review.create({
      data: {
        userId: user.id,
        spotId: spot.id,
        review: String(review),
        stars: Number(stars),
      },
    });

    res.status(201).json(rev);
  }
);

const validateNewSpotImage = [
  check("url").exists({ checkFalsy: true }).withMessage("URL is required"),
  check("preview").exists().isBoolean().withMessage("Preview flag is required"),
  handleValidationErrors,
];

router.post(
  "/:spotId/images",
  requireAuth,
  validateNewSpotImage,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    const { url, preview } = req.body;

    let spot = await getSpot(req.params["spotId"], res, (spotId) =>
      prisma.spot.findFirst({ where: { id: spotId } })
    );

    if (!spot) {
      return;
    }

    if (spot.ownerId !== user.id) {
      res
        .status(403)
        .json({ message: "You do not have permission to modify this spot" });
      return;
    }

    const img = await prisma.spotImage.create({
      data: { url, preview, spotId: spot.id },
    });

    res.status(201).json({ id: img.id, url, preview });
  }
);

const validateNewBooking = [
  check("startDate")
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage("startDate is required"),
  check("endDate")
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage("endDate is required"),
  handleValidationErrors,
];

router.post(
  "/:spotId/bookings",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { startDate: sd, endDate: ed } = req.body;
    const startDate = new Date(sd);
    const endDate = new Date(ed);

    if (startDate >= endDate) {
      res.status(400).json({
        message: "Bad Request",
        errors: { endDate: "endDate cannot be on or before startDate" },
      });
      return;
    }

    const user = req.user!;

    const spot = await getSpot(req.params["spotId"], res, (id) =>
      prisma.spot.findUnique({ where: { id } })
    );

    if (!spot) {
      return;
    }

    if (spot.ownerId == user.id) {
      res.status(403).json({
        message: "You own this spot, and cannot make a booking for it",
      });
      return;
    }

    let overlap = await bookingOverlap(spot.id, startDate, endDate);

    if (overlap) {
      let err: {
        message: string;
        errors: { startDate?: string; endDate?: string };
      } = {
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {},
      };

      if (overlap.startDate <= startDate && startDate <= overlap.endDate) {
        err.errors.startDate = "Start date conflicts with an existing booking";
      }
      if (overlap.startDate <= endDate && endDate <= overlap.endDate) {
        err.errors.endDate = "End date conflicts with an existing booking";
      }

      res.status(403).json(err);
      return;
    }

    let booking = await prisma.booking.create({
      data: {
        userId: user.id,
        spotId: spot.id,
        startDate,
        endDate,
      },
    });

    res.status(201).json({
      ...booking,
      startDate: formatDate(booking.startDate),
      endDate: formatDate(booking.endDate),
    });
  }
);

const getChecks = checkSchema(
  {
    page: { isInt: { options: { min: 1, max: 10 } }, optional: true },
    size: { isInt: { options: { min: 1, max: 20 } }, optional: true },
    minLat: { isDecimal: true, optional: true },
    maxLat: { isDecimal: true, optional: true },
    minLng: { isDecimal: true, optional: true },
    maxLng: { isDecimal: true, optional: true },
    minPrice: { isFloat: { options: { min: 0 } }, optional: true },
    maxPrice: { isFloat: { options: { min: 0 } }, optional: true },
  },
  ["query"]
);

router.get(
  "/",
  getChecks,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    const allSpots = await prisma.spot.findMany({
      include: {
        images: { 
          where: { preview: true }, 
          select: { url: true } 
        },
        reviews: { select: { stars: true } },
      },
    });

    const modspots = allSpots.map((spot: SpotWithRelations) => ({
      ...transformSpot(spot),
      previewImage: spot.images[0]?.url || ""
    }));

    res.json({ 
      Spots: modspots,  // Make sure we're sending an object with a Spots array
      page: 1,
      size: modspots.length
    });
  }
);

router.post(
  "/",
  requireAuth,
  validateNewSpot,
  async (req: Request, res: Response): Promise<void> => {
    let user = req.user!;

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

    const spot = await prisma.spot.create({
      data: {
        ownerId: user.id,
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

    res.status(201).json({ ...spot, lat, lng, price });
  }
);

export default router;
