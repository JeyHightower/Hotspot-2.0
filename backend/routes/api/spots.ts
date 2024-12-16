import { Router, Request, Response, NextFunction } from "express";
import {
	handleValidationErrors,
	bookingOverlap,
	parseI32,
} from "../../utils/validation.js";
import { Spot, SpotImage, User, Review } from '../../types/models.js'
import bcrypt from "bcryptjs";
import { check, checkSchema } from "express-validator";

import { setTokenCookie, requireAuth } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from "@prisma/client/runtime/library";
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
		previewImage: images[0]?.url ?? "",
		avgRating: reviews.reduce((acc: number, item: { stars: number }) => acc + item.stars, 0) / reviews.length,
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
	cb: (id: number) => Promise<T>,
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

router.get("/current", requireAuth, async (req: Request, res: Response): Promise<void> => {
	const allSpots = await prisma.spot.findMany({
		where: { ownerId: req.user!.id },
		include: {
			images: { where: { preview: true }, select: { url: true } },
			reviews: { select: { stars: true } },
		},
	});

	const modspots = allSpots.map(transformSpot);

	res.json({ Spots: modspots });
});

// Rest of the code remains the same, just add proper type annotations for req and res parameters
// and ensure all route handlers return Promise<void>

// Example for one more route handler:
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
		}),
	);

	if (!spot) {
		return;
	}

	const { reviews, images, owner, lat, lng, price, ...rest } = spot as any;

	const ret = {
		...rest,
		lat: Number(lat),
		lng: Number(lng),
		price: Number(price),
		numReviews: reviews.length,
		avgStarRating: reviews.reduce((acc: number, item: { stars: number }) => acc + item.stars, 0) / reviews.length,
		SpotImages: images,
		Owner: owner,
	};

	res.json(ret);

});
// Continue applying similar type fixes to all route handlers...

export default router;