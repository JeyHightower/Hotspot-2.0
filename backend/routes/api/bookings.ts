import { Router } from 'express';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { check } from 'express-validator';
import { handleValidationErrors, parseI32 } from '../../utils/validation.js';
import { setTokenCookie, restoreUser, requireAuth } from '../../utils/auth.js';
import { bookingOverlap } from '../../utils/validation.js';
import { prisma } from '../../dbclient.js';
import { Booking } from '@prisma/client';
import { sendResponse } from '../../utils/response.js';


const router = Router();

interface BookingRequest extends ExpressRequest {
  user?: any;
  body: {
    startDate: string;
    endDate: string;
  };
  params: {
    bookingId?: string;
  };
}

  export function formatDate(d: Date): string {
    return d.toISOString().split('T')[0]!;
  }
router.get('/current', requireAuth, async (req, res) => {
  const user = req.user!;
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      spot: {
        select: {
          images: { where: { preview: true }, select: { url: true } },
          id: true,
          ownerId: true,
          address: true,
          city: true,
          state: true,
          country: true,
          lat: true,
          lng: true,
          name: true,
          price: true,
        },
      },
    },
  });

  const sequelized = bookings.map((b) => {
    const { spot, startDate, endDate, ...rest } = b;
    const { images, ...spotRest } = spot;
    return {
      Spot: {
        previewImage: images[0]?.url ?? '',
        ...spotRest,
      },
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      ...rest,
    };
  });

  sendResponse(res, { Bookings: sequelized });
});

const validateNewBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage('startDate is required'),
  check('endDate')
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage('endDate is required'),
  handleValidationErrors,
];
router.put(
  '/:bookingId',
  requireAuth,
  validateNewBooking,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    let bookingId = parseI32(req.params['bookingId']);
    const { startDate, endDate } = req.body;

    if (!bookingId) {
      res.status(404).json({
        message: "Booking couldn't be found",
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { spot: true },
    });

    if (!booking) {
      res.status(404).json({
        message: "Booking couldn't be found",
      });
      return;
    }

    if (booking.userId !== user.id) {
      res.status(403).json({ message: 'You do not have permission to edit this booking' });
      return;
    }

    if (startDate >= endDate) {
      res.status(400).json({
        message: 'Bad Request',
        errors: { endDate: 'endDate cannot be on or before startDate' },
      });
      return;
    }

    let overlap = await prisma.booking.findFirst({
      where: {
        spotId: booking.spot.id,
        NOT: {
          id: booking.id,
        },
        endDate: { gte: startDate },
        startDate: { lte: endDate },
      },
    });

    if (overlap) {
      let err: {
        message: string;
        errors: { startDate?: string; endDate?: string };
      } = {
        message: 'Sorry, this spot is already booked for the specified dates',
        errors: {},
      };

      if (overlap.startDate <= startDate && startDate <= overlap.endDate) {
        err.errors.startDate = 'Start date conflicts with an existing booking';
      }
      if (overlap.startDate <= endDate && endDate <= overlap.endDate) {
        err.errors.endDate = 'End date conflicts with an existing booking';
      }

      res.status(403).json(err);
      return;
    }

    const newBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        startDate,
        endDate,
      },
    });
    res.status(201).json({
      ...newBooking,
      startDate: formatDate(newBooking.startDate),
      endDate: formatDate(newBooking.endDate),
    });
  },);

import { Request, Response } from 'express';

router.delete('/:bookingId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params;

  if (isNaN(Number(bookingId)) || Number(bookingId) > 2 ** 31) {
    res.status(404);
    sendResponse(res, { message: "Booking couldn't be found" });
    return;
  }

  const userId = req.user!.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        spot: { select: { ownerId: true } },
      },
    });

    if (!booking) {
      res.status(404);
      sendResponse(res, { message: "Booking couldn't be found" });
      return;
    }

    if (booking.userId !== userId && booking.spot.ownerId !== userId) {
      res.status(403);
      sendResponse(res, { message: 'You are not authorized to delete this booking' });
      return;
    }

    await prisma.booking.delete({ where: { id: Number(bookingId) } });
    sendResponse(res, { message: 'Successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500);
    sendResponse(res, { message: 'Internal Server Error' });
  }
});

export default router;