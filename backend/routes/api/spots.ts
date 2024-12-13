import { Prisma, Spot } from '@prisma/client';
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';
import { check, checkSchema } from 'express-validator';
import { prisma } from '../../dbclient.js';
import { requireAuth } from '../../utils/auth.js';
import {
  bookingOverlap,
  handleValidationErrors,
  parseI32,
} from '../../utils/validation.js';

const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

const router = Router();

function transformSpot(
  wholeSpot: Spot & {
    reviews: { stars: number }[];
    images: { url: string }[];
  },
): object {
  const { images, reviews, lat, lng, price, ...spot } = wholeSpot;

  return {
    ...spot,
    lat: Number(lat),
    lng: Number(lng),
    price: Number(price),
    previewImage: images[0]?.url ?? '',
    avgRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length,
  };
}
function parseSpotId(spotId: string | undefined, res: Response): number | null {
  const id = parseI32(spotId);
  if (id !== null) return id;
  res.status(404).json({ message: "Spot couldn't be found" });
  return null;
}

async function getSpot<T>(
  id: string | undefined,
  res: Response,
  cb: (id: number) => Promise<T>,
): Promise<T | null> {
  let spotId = parseSpotId(id, res);
  if (!spotId) return null;

  let data = await cb(spotId);
  if (data) return data;

  res.status(404).json({ message: "Spot couldn't be found" });
  return null;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

const validateNewSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city').exists({ checkFalsy: true }).withMessage('City is required'),
  check('state').exists({ checkFalsy: true }).withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage('Latitude is not valid'),
  check('lng')
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage('Longitude is not valid'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price')
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage('Price per day is required'),
  handleValidationErrors,
];
const validateNewSpotImage = [
  check('url').exists({ checkFalsy: true }).withMessage('URL is required'),
  check('preview').exists().isBoolean().withMessage('Preview flag is required'),
  handleValidationErrors,
];

const validateNewReview = [
  check('review')
    .exists({ checkFalsy: true })
    .isString()
    .withMessage('Review text is required'),
  check('stars').exists({ checkFalsy: true }).isInt({ min: 1, max: 5 }),
  handleValidationErrors,
];

const validateNewBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('startDate is required'),
  check('endDate')
    .exists({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('endDate is required'),
  handleValidationErrors,
];

router.get(
  '/current',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const allSpots = await prisma.spot.findMany({
      where: { ownerId: req.user!.id },
      include: {
        images: { where: { preview: true }, select: { url: true } },
        reviews: { select: { stars: true } },
      },
    });
    res.json({ Spots: allSpots.map(transformSpot) });
  }),
);
router.get(
  '/:spotId',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const spot = await getSpot(req.params.spotId, res, (spotId) =>
      prisma.spot.findFirst({
        where: { id: spotId },
        include: {
          images: { select: { id: true, url: true, preview: true } },
          reviews: { select: { stars: true } },
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    );

    if (!spot) return;

    const { reviews, images, owner, lat, lng, price, ...rest } = spot;
    res.json({
      ...rest,
      lat: Number(lat),
      lng: Number(lng),
      price: Number(price),
      numReviews: reviews.length,
      avgStarRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length,
      SpotImages: images,
      Owner: owner,
    });
  }),
);

router.post(
  '/',
  requireAuth,
  validateNewSpot,
  asyncHandler(async (req: Request, res: Response) => {
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

    res.status(201).json({ ...spot, lat, lng, price });
  }),
);
router.put(
  '/:spotId',
  requireAuth,
  validateNewSpot,
  asyncHandler(async (req: Request, res: Response) => {
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } }),
    );
    if (!spot) return;

    if (spot.ownerId !== req.user!.id) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to edit this spot' });
    }

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

    res.json({ ...updated, lat, lng, price });
  }),
);

router.delete(
  '/:spotId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findFirst({
        where: { id },
        select: { id: true, ownerId: true },
      }),
    );
    if (!spot) return;

    if (spot.ownerId !== req.user!.id) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to delete this spot' });
    }

    await prisma.spot.delete({ where: { id: spot.id } });
    res.json({ message: 'Successfully deleted' });
  }),
);
router.get(
  '/:spotId/reviews',
  asyncHandler(async (req: Request, res: Response) => {
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } }),
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
      Reviews: reviews.map(({ user, images, ...rest }) => ({
        ...rest,
        User: user,
        ReviewImages: images,
      })),
    });
  }),
);

router.post(
  '/:spotId/reviews',
  requireAuth,
  validateNewReview,
  asyncHandler(async (req: Request, res: Response) => {
    const spot = await getSpot(req.params.spotId, res, (spotId) =>
      prisma.spot.findFirst({
        where: { id: spotId },
        include: { reviews: { where: { userId: req.user!.id } } },
      }),
    );
    if (!spot) return;

    if (spot.reviews.length) {
      return res
        .status(500)
        .json({ message: 'User already has a review for this spot' });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        spotId: spot.id,
        review: req.body.review,
        stars: req.body.stars,
      },
    });

    res.status(201).json(review);
  }),
);
router.get(
  '/:spotId/bookings',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } }),
    );
    if (!spot) return;

    if (spot.ownerId === req.user!.id) {
      const bookings = await prisma.booking.findMany({
        where: { spotId: spot.id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        select: {
          id: true,
          spotId: true,
          userId: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          user: true,
        },
      });

      res.json({
        Bookings: bookings.map(({ user, ...booking }) => ({
          ...booking,
          User: user,
          startDate: formatDate(booking.startDate),
          endDate: formatDate(booking.endDate),
        })),
      });
    } else {
      const bookings = await prisma.booking.findMany({
        where: { spotId: spot.id },
        select: { spotId: true, startDate: true, endDate: true },
      });

      res.json({
        Bookings: bookings.map((booking) => ({
          ...booking,
          startDate: formatDate(booking.startDate),
          endDate: formatDate(booking.endDate),
        })),
      });
    }
  }),
);
router.post(
  '/:spotId/images',
  requireAuth,
  validateNewSpotImage,
  asyncHandler(async (req: Request, res: Response) => {
    const spot = await getSpot(req.params.spotId, res, (spotId) =>
      prisma.spot.findFirst({ where: { id: spotId } }),
    );
    if (!spot) return;

    if (spot.ownerId !== req.user!.id) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to modify this spot' });
    }

    const { url, preview } = req.body;
    const img = await prisma.spotImage.create({
      data: { url, preview, spotId: spot.id },
    });

    res.status(201).json({ id: img.id, url, preview });
  }),
);

router.post(
  '/:spotId/bookings',
  requireAuth,
  validateNewBooking,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate: sd, endDate: ed } = req.body;
    const startDate = new Date(sd);
    const endDate = new Date(ed);

    if (startDate >= endDate) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: { endDate: 'endDate cannot be on or before startDate' },
      });
    }

    const spot = await getSpot(req.params.spotId, res, (id) =>
      prisma.spot.findUnique({ where: { id } }),
    );
    if (!spot) return;

    if (spot.ownerId === req.user!.id) {
      return res.status(403).json({
        message: 'You own this spot, and cannot make a booking for it',
      });
    }
    const overlap = await bookingOverlap(spot.id, startDate, endDate);
    if (overlap) {
      const errors: Record<string, string> = {};
      if (overlap.startDate <= startDate && startDate <= overlap.endDate) {
        errors.startDate = 'Start date conflicts with an existing booking';
      }
      if (overlap.startDate <= endDate && endDate <= overlap.endDate) {
        errors.endDate = 'End date conflicts with an existing booking';
      }
      return res.status(403).json({
        message: 'Sorry, this spot is already booked for the specified dates',
        errors,
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
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
  }),
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
  ['query'],
);

router.get(
  '/',
  getChecks,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
      req.query;
    const where: Prisma.SpotWhereInput = {};

    const parsedSize = Number(size) || 20;
    const parsedPage = Number(page) || 1;

    if (minLat || maxLat) {
      where.lat = {};
      if (minLat) where.lat.gte = Number(minLat);
      if (maxLat) where.lat.lte = Number(maxLat);
    }

    if (minLng || maxLng) {
      where.lng = {};
      if (minLng) where.lng.gte = Number(minLng);
      if (maxLng) where.lng.lte = Number(maxLng);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const allSpots = await prisma.spot.findMany({
      include: {
        images: { where: { preview: true }, select: { url: true } },
        reviews: { select: { stars: true } },
      },
      orderBy: { id: 'desc' },
      where,
      skip: parsedSize * (parsedPage - 1),
      take: parsedSize,
    });

    res.json({
      Spots: allSpots.map(transformSpot),
      page: parsedPage,
      size: parsedSize,
    });
  }),
);

export default router;
