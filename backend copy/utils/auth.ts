// backend/utils/auth.js
import jwt from "jsonwebtoken";
import config from "../config/index.js";

import { Response, Request, NextFunction, Express } from "express";
import { User } from "@prisma/client";
import { prisma } from "../dbclient.js";

declare global {
	namespace Express {
		export interface Request {
			user?: User | null;
		}
	}
}

const { jwtConfig } = config;
const { secret: secretRaw, expiresIn: expiresInStr } = jwtConfig;

const err = () => {
	throw Error("no secret");
};

const expiresIn = parseInt(expiresInStr!);
const secret = secretRaw || err();

export function setTokenCookie(
	res: Response,
	user: { id: number; email: string; username: string },
): string {
	const safeUser = {
		id: user.id,
		email: user.email,
		username: user.username,
	};

	const token = jwt.sign({ data: safeUser }, secret, { expiresIn });

	res.cookie("token", token, {
		maxAge: expiresIn * 1000,
		httpOnly: true,
		secure: config.isProduction,
		sameSite: config.isProduction && "lax",
	});

	return token;
}

export function restoreUser(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	let token: string | null = null;

	if ("token" in req.cookies) {
		token = req.cookies["token"];
	}
	return jwt.verify(token ?? "", secret, {}, async (err, jwtPayload) => {
		if (err) {
			return next();
		}

		try {
			const { id } = (jwtPayload as any).data;

			req.user = await prisma.user.findUnique({ where: { id: id } });
		} catch (e) {
			res.clearCookie("token");
			return next();
		}

		if (!req.user) res.clearCookie("token");

		return next();
	});
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
	if (req.user) return next();

	const err = new Error("Authentication required") as any;
	err.title = "Authentication required";
	err.errors = { message: "Authentication required" };
	err.status = 401;

	return next(err);
}
