import { Router, Request, Response, NextFunction } from "express";
import { check } from "express-validator";
import { handleValidationErrors } from "../../utils/validation.js";

const router = Router();

import bcrypt from "bcryptjs";
import { setTokenCookie, restoreUser } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";

const validateLogin = [
	check("credential")
		.exists({ checkFalsy: true })
		.notEmpty()
		.withMessage("Please provide a valid email or username."),
	check("password")
		.exists({ checkFalsy: true })
		.withMessage("Please provide a password."),
	handleValidationErrors,
];

router.post(
	"/",
	validateLogin,
	async (req: Request, res: Response, next: NextFunction) => {
		const { credential, password } = req.body;
		console.log(credential, password)

		const user = await prisma.user.findFirst({
			where: {
				OR: [{ username: credential }, { email: credential }],
			},
		});

		if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
			res.status(401);
			return res.json({ message: "Invalid credentials" });
		}

		const safeUser = {
			id: user.id,
			email: user.email,
			username: user.username,
		};

		setTokenCookie(res, safeUser);

		return res.json({
			user: { ...safeUser, firstName: user.firstName, lastName: user.lastName },
		});
	},
);

router.delete("/", (_req, res) => {
	res.clearCookie("token");
	return res.json({ message: "success" });
});

router.get("/", (req, res) => {
	const { user } = req;
	if (user) {
		const safeUser = {
			id: user.id,
			email: user.email,
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
		};
		return res.json({
			user: safeUser,
		});
	} else return res.json({ user: null });
});

export default router;
