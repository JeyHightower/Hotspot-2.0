import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { RequestHandler, Router } from 'express';
import { requireAuth } from '../../utils/auth.js';
import { prisma } from '../../utils/db.js'; // Add .js extension
import { validateNewSpot } from '../../utils/validation';

const router = Router();

interface SpotRequest extends ExpressRequest {
  user?: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    hashedPassword: string;
    createdAt: Date;
    updatedAt: Date;
  };
  body: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
    name?: string;
    description?: string;
    price?: number;
    startDate?: string;
    endDate?: string;
    url?: string;
    preview?: boolean;
  };
  params: {
    spotId?: string;
    imageId?: string;
  };
  query: {
    page?: string;
    size?: string;
    minLat?: string;
    maxLat?: string;
    minLng?: string;
    maxLng?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

const getSpot = async (
  spotId: string,
  res: ExpressResponse,
  onSuccess: (id: number) => Promise<void>,
): Promise<void> => {
  const id = parseInt(spotId);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid spot id' });
    return;
  }

  const spot = await prisma.spot.findUnique({
    where: { id },
  });

  if (!spot) {
    res.status(404).json({ message: "Spot couldn't be found" });
    return;
  }

  await onSuccess(id);
};

router.get(
  '/',
  router.get(
    '/',

    async (req: SpotRequest, res: ExpressResponse): Promise<void> => {
      const {
        page = '1',
        size = '20',
        minLat,
        maxLat,
        minLng,
        maxLng,
        minPrice,
        maxPrice,
      } = req.query;

      const pageNum = parseInt(page as string);
      const sizeNum = parseInt(size as string);

      const where = {
        ...(minLat && { lat: { gte: parseFloat(minLat as string) } }),
        ...(maxLat && { lat: { lte: parseFloat(maxLat as string) } }),
        ...(minLng && { lng: { gte: parseFloat(minLng as string) } }),
        ...(maxLng && { lng: { lte: parseFloat(maxLng as string) } }),
        ...(minPrice && { price: { gte: parseFloat(minPrice as string) } }),
        ...(maxPrice && { price: { lte: parseFloat(maxPrice as string) } }),
      };

      const spots = await prisma.spot.findMany({
        where,
        take: sizeNum,
        skip: (pageNum - 1) * sizeNum,
        include: {
          SpotImages: {
            where: { preview: true },
            select: { url: true },
          },
          Reviews: {
            select: { stars: true },
          },
        },
      });

      res.json({
        Spots: spots.map((spot: any) => ({
          ...spot,
          previewImage: spot.SpotImages[0]?.url || null,
          avgRating: spot.Reviews.length
            ? spot.Reviews.reduce(
                (sum: number, review: any) => sum + review.stars,
                0,
              ) / spot.Reviews.length
            : null,
        })),
        page: pageNum,
        size: sizeNum,
      });
    },
  ),
);

import { ParsedQs } from 'qs';

const getSpotHandler: RequestHandler<
  Record<string, string>,
  any,
  any,
  ParsedQs,
  Record<string, any>
> = async (req, res) => {
  // Handler implementation
};

router.get(
  '/current',
  requireAuth,
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    const spots = await prisma.spot.findMany({
      where: { ownerId: req.user!.id },
      include: {
        SpotImages: {
          where: { preview: true },
          select: { url: true },
        },
        Reviews: {
          select: { stars: true },
        },
      },
    });

    res.json({
      Spots: spots.map((spot: any) => ({
        ...spot,
        previewImage: spot.SpotImages[0]?.url || null,
        avgRating: spot.Reviews.length
          ? spot.Reviews.reduce(
              (sum: number, review: any) => sum + review.stars,
              0,
            ) / spot.Reviews.length
          : null,
      })),
    });
  },
);

router.get(
  '/:spotId',
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    await getSpot(req.params['spotId']!, res, async (id) => {
      const spot = await prisma.spot.findUnique({
        where: { id },
        include: {
          Owner: {
            select: { id: true, firstName: true, lastName: true },
          },
          SpotImages: {
            select: { id: true, url: true, preview: true },
          },
          Reviews: {
            select: { stars: true },
          },
        },
      });

      const numReviews = spot!.Reviews.length;
      const avgStarRating = numReviews
        ? spot!.Reviews.reduce(
            (sum: number, review: any) => sum + review.stars,
            0,
          ) / numReviews
        : null;

      res.json({
        ...spot,
        numReviews,
        avgStarRating,
        SpotImages: spot!.SpotImages,
        Owner: spot!.Owner,
      });
    });
  },
);

router.post(
  '/',
  requireAuth,
  validateNewSpot,
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    const spot = await prisma.spot.create({
      data: {
        ...(req.body as Required<typeof req.body>),
        ownerId: req.user!.id,
      },
    });
    res.status(201).json(spot);
  },
);

router.post(
  '/:spotId/images',
  requireAuth,
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    await getSpot(req.params['spotId']!, res, async (id) => {
      const spot = await prisma.spot.findUnique({
        where: { id },
      });

      if (spot!.ownerId !== req.user!.id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const image = await prisma.spotImage.create({
        data: {
          spotId: id,
          url: req.body.url!,
          preview: req.body.preview,
        },
      });

      res.json({
        id: image.id,
        url: image.url,
        preview: image.preview,
      });
    });
  },
);

router.put(
  '/:spotId',
  requireAuth,
  validateNewSpot,
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    await getSpot(req.params['spotId']!, res, async (id) => {
      const spot = await prisma.spot.findUnique({
        where: { id },
      });

      if (spot!.ownerId !== req.user!.id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const updatedSpot = await prisma.spot.update({
        where: { id },
        data: req.body as Required<typeof req.body>,
      });

      res.json(updatedSpot);
    });
  },
);

router.delete(
  '/:spotId',
  requireAuth,
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    await getSpot(req.params['spotId']!, res, async (id) => {
      const spot = await prisma.spot.findUnique({
        where: { id },
      });

      if (spot!.ownerId !== req.user!.id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      await prisma.spot.delete({
        where: { id },
      });

      res.json({ message: 'Successfully deleted' });
    });
  },
);

router.post(
  '/:spotId/bookings',
  requireAuth,
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    const { startDate: sd, endDate: ed } = req.body;
    const startDate = new Date(sd!);
    const endDate = new Date(ed!);

    if (endDate <= startDate) {
      res.status(400).json({
        message: 'Bad Request',
        errors: {
          endDate: 'endDate cannot be on or before startDate',
        },
      });
      return;
    }

    await getSpot(req.params['spotId']!, res, async (spotId) => {
      const spot = await prisma.spot.findUnique({
        where: { id: spotId },
        include: {
          Bookings: true,
        },
      });

      if (spot!.ownerId === req.user!.id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const conflictingBooking = spot!.Bookings.find((booking: any) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        return (
          (startDate >= bookingStart && startDate <= bookingEnd) ||
          (endDate >= bookingStart && endDate <= bookingEnd) ||
          (startDate <= bookingStart && endDate >= bookingEnd)
        );
      });

      if (conflictingBooking) {
        res.status(403).json({
          message: 'Sorry, this spot is already booked for the specified dates',
          errors: {
            startDate: 'Start date conflicts with an existing booking',
            endDate: 'End date conflicts with an existing booking',
          },
        });
        return;
      }

      const booking = await prisma.booking.create({
        data: {
          spotId,
          userId: req.user!.id,
          startDate,
          endDate,
        },
      });

      res.json(booking);
    });
  },
);

router.get(
  '/:spotId/bookings',
  requireAuth,
  async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    await getSpot(req.params['spotId']!, res, async (spotId) => {
      const spot = await prisma.spot.findUnique({
        where: { id: spotId },
      });

      const bookings = await prisma.booking.findMany({
        where: { spotId },
        include: {
          User:
            spot!.ownerId === req.user!.id
              ? {
                  select: { id: true, firstName: true, lastName: true },
                }
              : false,
        },
      });

      res.json({ Bookings: bookings });
    });
  },
);

export default router;
