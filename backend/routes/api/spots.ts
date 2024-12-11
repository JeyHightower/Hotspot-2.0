import { Router, RequestHandler } from 'express';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { requireAuth } from '../../utils/auth.js';
import { prisma } from '../../dbclient.js';
import { handleValidationErrors } from '../../utils/validation.js';

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

interface Review {
  stars: number;
}

interface SpotImage {
  url: string;
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

router.get('/', handleValidationErrors, (async (req: SpotRequest, res: ExpressResponse) => {
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

  const pageNum = parseInt(page);
  const sizeNum = parseInt(size);

  const where = {
    ...(minLat && { lat: { gte: parseFloat(minLat) } }),
    ...(maxLat && { lat: { lte: parseFloat(maxLat) } }),
    ...(minLng && { lng: { gte: parseFloat(minLng) } }),
    ...(maxLng && { lng: { lte: parseFloat(maxLng) } }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
  };

  const spots = await prisma.spot.findMany({
    where,
    take: sizeNum,
    skip: (pageNum - 1) * sizeNum,
    include: {
      images: {
        where: { preview: true },
        select: { url: true },
      },
      reviews: {
        select: { stars: true },
      },
    },
  });

  res.json({
    Spots: spots.map((spot) => ({
      ...spot,
      previewImage: spot.images[0]?.url || null,
      avgRating: spot.reviews.length
        ? spot.reviews.reduce((sum: number, review: Review) => sum + review.stars, 0) /
          spot.reviews.length
        : null,
    })),
    page: pageNum,
    size: sizeNum,
  });
}) as RequestHandler);

router.get(
  '/current',
  requireAuth,
  (async (req: SpotRequest, res: ExpressResponse) => {
    const spots = await prisma.spot.findMany({
      where: { ownerId: req.user!.id },
      include: {
        images: {
          where: { preview: true },
          select: { url: true },
        },
        reviews: {
          select: { stars: true },
        },
      },
    });

    res.json({
      Spots: spots.map((spot) => ({
        ...spot,
        previewImage: spot.images[0]?.url || null,
        avgRating: spot.reviews.length
          ? spot.reviews.reduce((sum: number, review: Review) => sum + review.stars, 0) /
            spot.reviews.length
          : null,
      })),
    });
  }) as RequestHandler
);

router.post('/', requireAuth, handleValidationErrors, (async (req: SpotRequest, res: ExpressResponse) => {
  const spot = await prisma.spot.create({
    data: {
      ...req.body as Required<typeof req.body>,
      ownerId: req.user!.id,
    },
  });
  res.status(201).json(spot);
}) as RequestHandler);

router.get('/:spotId', (async (req: SpotRequest, res: ExpressResponse) => {
  await getSpot(req.params.spotId!, res, async (id) => {
    const spot = await prisma.spot.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        images: {
          select: { id: true, url: true, preview: true },
        },
        reviews: {
          select: { stars: true },
        },
      },
    });

    const numReviews = spot!.reviews.length;
    const avgStarRating = numReviews
      ? spot!.reviews.reduce((sum: number, review: Review) => sum + review.stars, 0) / numReviews
      : null;

    res.json({
      ...spot,
      numReviews,
      avgStarRating,
      SpotImages: spot!.images,
      Owner: spot!.owner,
    });
  });
}) as RequestHandler);

router.post('/:spotId/images', requireAuth, (async (req: SpotRequest, res: ExpressResponse) => {
  await getSpot(req.params.spotId!, res, async (id) => {
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
        preview: req.body.preview ?? false,
      },
    });

    res.json({
      id: image.id,
      url: image.url,
      preview: image.preview,
    });
  });}) as RequestHandler);  (async (req: SpotRequest, res: ExpressResponse) => {
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
          preview: req.body.preview ?? false,
        },
      });

      res.json({
        id: image.id,
        url: image.url,
        preview: image.preview,
      });
    });  }) as RequestHandler


router.put(
  '/:spotId',
  requireAuth,
  handleValidationErrors,
  (async (req: SpotRequest, res: ExpressResponse) => {
    await getSpot(req.params.spotId!, res, async (id) => {
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
  }) as RequestHandler
);

router.delete(
  '/:spotId',
  requireAuth,
  (async (req: SpotRequest, res: ExpressResponse) => {
    await getSpot(req.params.spotId!, res, async (id) => {
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
  }) as RequestHandler
);

router.post(
  '/:spotId/bookings',
  requireAuth,
  (async (req: SpotRequest, res: ExpressResponse) => {
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

    await getSpot(req.params.spotId!, res, async (spotId) => {
      const spot = await prisma.spot.findUnique({
        where: { id: spotId },
        include: {
          bookings: true,
        },
      });

      if (spot!.ownerId === req.user!.id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const conflictingBooking = spot!.bookings.find((booking: any) => {
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
  }) as RequestHandler
);

router.get(
  '/:spotId/bookings',
  requireAuth,
  (async (req: SpotRequest, res: ExpressResponse) => {
    await getSpot(req.params.spotId!, res, async (spotId) => {
      const spot = await prisma.spot.findUnique({
        where: { id: spotId },
      });

      const bookings = await prisma.booking.findMany({
        where: { spotId },
        include: {
          user:
            spot!.ownerId === req.user!.id
              ? {
                  select: { id: true, firstName: true, lastName: true },
                }
              : false,
        },
      });

      res.json({ Bookings: bookings });
    });
  }) as RequestHandler
);

export default router;