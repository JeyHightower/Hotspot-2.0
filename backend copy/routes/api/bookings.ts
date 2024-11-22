import { Router, Request, Response, NextFunction } from "express";
import { check } from "express-validator";
import { handleValidationErrors, parseI32 } from "../../utils/validation.js";

const router = Router();

import bcrypt from "bcryptjs";
import { setTokenCookie, restoreUser, requireAuth } from "../../utils/auth.js";
import { bookingOverlap } from "../../utils/validation.js";
import { prisma } from "../../dbclient.js";
import { Booking } from "@prisma/client";

function formatDate(d: Date): string {
	return d.toISOString().split("T")[0]!;
}

router.get("/current", requireAuth, async (req, res) => {
	const user = req.user!;

	let bookings = await prisma.booking.findMany({
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
				previewImage: images[0]?.url ?? "",
				...spotRest,
			},
			startDate: startDate.toDateString(),
			endDate: endDate.toDateString(),
			...rest,
		};
	});

	where:""

	return res.json({ Bookings: sequelized });
});

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

router.put(
	"/:bookingId",
	requireAuth,
	validateNewBooking,
	async (req: Request, res: Response) => {
		const user = req.user!;
		let bookingId = parseI32(req.params["bookingId"]);
		const { startDate, endDate } = req.body;

		if (!bookingId) {
			return res.status(404).json({
				message: "Booking couldn't be found",
			});
		}

		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: { spot: true },
		});

		if (!booking) {
			return res.status(404).json({
				message: "Booking couldn't be found",
			});
		}

		if (booking.userId !== user.id) {
			return res
				.status(403)
				.json({ message: "You do not have permission to edit this booking" });
		}

		if (startDate >= endDate) {
			return res.status(400).json({
				message: "Bad Request",
				errors: { endDate: "endDate cannot be on or before startDate" },
			});
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
				message: "Sorry, this spot is already booked for the specified dates",
				errors: {},
			};

			if (overlap.startDate <= startDate && startDate <= overlap.endDate) {
				err.errors.startDate = "Start date conflicts with an existing booking";
			}
			if (overlap.startDate <= endDate && endDate <= overlap.endDate) {
				err.errors.endDate = "End date conflicts with an existing booking";
			}

			return res.status(403).json(err);
		}

		const newBooking = await prisma.booking.update({
			where: { id: booking.id },
			data: {
				startDate,
				endDate,
			},
		});
		return res.status(201).json({
			...newBooking,
			startDate: formatDate(newBooking.startDate),
			endDate: formatDate(newBooking.endDate),
		});
	},
);

// delete booking by  bookingid

router.delete("/:bookingId", requireAuth, async (req, res) => {
	return async (req: Request, res: Response) => {
		const { bookingId } = req.params;

		if (isNaN(Number(bookingId)) || Number(bookingId) > 2 ** 31) {
			return res.status(404).json({ message: "Booking couldn't be found" });
		}

		const userId = req.user!.id;

		try {
			const booking = await prisma.booking.findUnique({
				where: {
					id: Number(bookingId),
				},
				include: {
					spot: {
						select: {
							ownerId: true,
						},
					},
				},
			});

			if (!booking) {
				if (
					!(await prisma.booking.findUnique({
						where: { id: Number(bookingId) },
					}))
				) {
					return res.status(404).json({ message: "Booking couldn't be found" });
				}
				return res
					.status(403)
					.json({ message: "You are not authorized to delete this booking" });
			}

			if (booking.userId !== userId && booking.spot.ownerId !== userId) {
				return res
					.status(403)
					.json({ message: "You are not authorized to delete this booking" });
			}

			await prisma.booking.delete({ where: { id: Number(bookingId) } });
			return res.status(200).json({ message: "successfully deleted" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	};
});

export default router;
