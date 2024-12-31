"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../../utils/validation");
const router = (0, express_1.Router)();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prismaClient_1 = require("../../prismaClient");
const auth_1 = require("../../utils/auth");
const validateLogin = [
    (0, express_validator_1.check)("credential")
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("Please provide a valid email or username."),
    (0, express_validator_1.check)("password")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a password."),
    validation_1.handleValidationErrors,
];
router.post("/", validateLogin, async (req, res, next) => {
    const { credential, password } = req.body;
    try {
        const user = await prismaClient_1.prismaClient.user.findFirst({
            where: {
                OR: [{ username: credential }, { email: credential }],
            },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.hashedPassword))) {
            res.status(401).json({
                message: "Invalid credentials",
                errors: { credential: "The provided credentials were invalid." },
            });
            return;
        }
        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        await (0, auth_1.setTokenCookie)(res, safeUser);
        res.json({ user: safeUser });
    }
    catch (error) {
        next(error);
    }
});
router.delete("/", (_req, res) => {
    res.clearCookie("token");
    res.json({ message: "success" });
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
        res.json({
            user: safeUser,
        });
    }
    else {
        res.json({ user: null });
    }
});
exports.default = router;
//# sourceMappingURL=session.js.map