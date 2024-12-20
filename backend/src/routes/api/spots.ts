import { Request, Response, Router } from "express";
import { check, checkSchema } from "express-validator";
import {
  bookingOverlap,
  handleValidationErrors,
  parseI32,
} from "../../utils/validation.js";

import { Prisma } from "@prisma/client";
import { prisma } from "../../dbclient.js";
import { requireAuth } from "../../utils/auth.js";

const router = Router();

function transformSpot(wholeSpot: any): object {
  const { images, reviews, lat, lng, price, ...spot } = wholeSpot;

  return {
    ...spot,
    lat: Number(lat),
    lng: Number(lng),
    price: Number(price),
    previewImage: images[0]?.url ?? "",
    avgRating:
      reviews.reduce((a: any, i: { stars: any }) => a + i.stars, 0) /
      reviews.length,
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

async function getSpot<T>(
  id: string | undefined,
  res: Response,
  cb: (id: number) => Promise<T>
): Promise<T | null> {
  let spotId = parseSpotId(id, res);

  if (spotId) {
    let data = await cb(spotId);

    if (data) {
      return data;
    }

    res.status(404).json({ message: "Spot couldn't be found" });
    return null;
  } else {
    return null;
  }
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
        images: { where: { preview: true }, select: { url: true } },
        reviews: { select: { stars: true } },
      },
    });

    const modspots = allSpots.map((spot: any) => transformSpot(spot as any));
    res.json({ Spots: modspots });
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
    prisma.spot.findFirst({
      where: { id: spotId },
      include: {
        images: { select: { id: true, url: true, preview: true } },
        reviews: { select: { stars: true } },
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })
  );

  if (!spot) {
    return;
  }

  const { reviews, images, owner, lat, lng, price, ...rest } = spot;

  res.json({
    ...rest,
    lat: Number(lat),
    lng: Number(lng),
    price: Number(price),
    numReviews: reviews.length,
    avgStarRating:
      reviews.reduce((a: number, i: { stars: number }) => a + i.stars, 0) /
      reviews.length,
    SpotImages: images,
    Owner: owner,
  });
});

router.put(
  "/:spotId",
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

    const spot = await getSpot(req.params["spotId"], res, (id) =>
      prisma.spot.findUnique({ where: { id } })
    );

    if (!spot) {
      return;
    }

    if (spot.ownerId !== user.id) {
      res
        .status(403)
        .json({ message: "You do not have permission to edit this spot" });
      return;
    }

    let updated = await prisma.spot.update({
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

    res.status(200).json({ ...updated, lat, lng, price });
  }
);

router.delete(
  "/:spotId",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    let user = req.user!;

    const spot = await getSpot(req.params["spotId"], res, (spotId) =>
      prisma.spot.findFirst({
        where: { id: spotId },
        select: { id: true, ownerId: true },
      })
    );

    if (!spot) {
      return;
    }

    if (spot.ownerId !== user.id) {
      res
        .status(403)
        .json({ message: "You do not have permission to delete this spot" });
      return;
    }

    await prisma.spot.delete({ where: { id: spot.id } });
    res.status(200).json({ message: "Successfully deleted" });
  }
);

router.get(
  "/:spotId/bookings",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;

    const spot = await getSpot(req.params["spotId"], res, (id) =>
      prisma.spot.findUnique({ where: { id } })
    );

    if (!spot) {
      return;
    }

    if (spot.ownerId == user.id) {
      const bookings = await prisma.booking.findMany({
        where: {
          spotId: spot.id,
        },
        select: {
          user: { select: { id: true, firstName: true, lastName: true } },
          id: true,
          spotId: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const sequelized = bookings.map((b: { [x: string]: any; user: any }) => {
        const { user, ...rest } = b;
        return {
          User: user,
          ...rest,
        };
      });

      res.json({ Bookings: sequelized });
    } else {
      const bookings = await prisma.booking.findMany({
        where: { spotId: spot.id, userId: user.id },
        select: { startDate: true, endDate: true, spotId: true },
      });

      res.json({ Bookings: bookings });
    }
  }
);

router.get(
  "/:spotId/reviews",
  async (req: Request, res: Response): Promise<void> => {
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } })
    );

    if (!spot) {
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { spotId: spot.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        images: { select: { id: true, url: true } },
      },
    });

    const out = reviews.map(
      (r: { [x: string]: any; user: any; images: any }) => {
        const { user, images, ...rest } = r;
        return {
          User: user,
          ReviewImages: images,
          ...rest,
        };
      }
    );

    res.json({ Reviews: out });
  }
);

const validateNewReview = [
  check("review")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("Review text is required"),
  check("stars").exists({ checkFalsy: true }).isInt({ min: 1, max: 5 }),
  handleValidationErrors,
];

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
    const { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
      req.query;

    type WhereType = Prisma.Args<typeof prisma.spot, "findMany">["where"];
    const where: WhereType = {};

    let parsedSize = 20;
    if (size !== undefined) {
      parsedSize = Number(size);
    }

    let pars;
    let parsedPage = 1;
    if (page !== undefined) {
      parsedPage = Number(page);
    }

    where.lat = {};

    if (minLat !== undefined) {
      where.lat.gte = Number(minLat);
    }
    if (maxLat !== undefined) {
      where.lat.lte = Number(maxLat);
    }

    where.lng = {};

    if (minLng !== undefined) {
      where.lng.gte = Number(minLng);
    }
    if (maxLng !== undefined) {
      where.lng.lte = Number(maxLng);
    }

    where.price = {};

    if (minPrice !== undefined) {
      where.price.gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      where.price.lte = Number(maxPrice);
    }

    const allSpots = await prisma.spot.findMany({
      include: {
        images: { where: { preview: true }, select: { url: true } },
        reviews: { select: { stars: true } },
      },
      orderBy: { id: "desc" },
      where,
      skip: parsedSize * (parsedPage - 1),
      take: parsedSize,
    });

    const modspots = allSpots.map(transformSpot);
    res.json({ Spots: modspots, page: parsedPage, size: parsedSize });
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
