"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../../utils/validation");
const prismaClient_1 = require("../../prismaClient");
const auth_1 = require("../../utils/auth");
const router = (0, express_1.Router)();
const validateSignup = [
    (0, express_validator_1.check)("email")
        .exists({ checkFalsy: true })
        .isLength({ max: 256 })
        .isEmail()
        .withMessage("Please provide a valid email at most 256 chars."),
    (0, express_validator_1.check)("username")
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage("Please provide a username with at least 4 characters."),
    (0, express_validator_1.check)("username")
        .exists({ checkFalsy: true })
        .isLength({ max: 30 })
        .withMessage("Please provide a username less than 30 characters."),
    (0, express_validator_1.check)("username").not().isEmail().withMessage("Username cannot be an email."),
    (0, express_validator_1.check)("password")
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage("Password must be 6 characters or more."),
    (0, express_validator_1.check)("firstName")
        .exists({ checkFalsy: true })
        .withMessage("firstName must be passed"),
    (0, express_validator_1.check)("lastName")
        .exists({ checkFalsy: true })
        .withMessage("lastName must be passed"),
    validation_1.handleValidationErrors,
];
router.post("/", validateSignup, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username, firstName, lastName } = req.body;
    const hashedPassword = yield bcryptjs_1.default.hash(password, 2);
    try {
        const user = yield prismaClient_1.prismaClient.user.create({
            data: { email, username, hashedPassword, firstName, lastName },
        });
        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            hashedPassword: user.hashedPassword,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        yield (0, auth_1.setTokenCookie)(res, safeUser);
        res.json({ user: safeUser });
    }
    catch (e) {
        if (e.code === "P2002") {
            res.status(500).json({
                message: "User already exists",
                errors: { email: "User with that email already exists" },
            });
            return;
        }
        if (e instanceof Error) {
            next(e);
        }
        else {
            next(new Error("An unknown error occurred"));
        }
    }
}));
exports.default = router;
