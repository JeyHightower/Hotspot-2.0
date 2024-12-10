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
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_js_1 = require("../../utils/validation.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_js_1 = require("../../utils/auth.js");
const dbclient_js_1 = require("../../dbclient.js");
const response_js_1 = require("../../utils/response.js");
const router = (0, express_1.Router)();
const validateLogin = [
    (0, express_validator_1.check)('credential')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Please provide a valid email or username.'),
    (0, express_validator_1.check)('password')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a password.'),
    validation_js_1.handleValidationErrors,
];
router.post('/', validateLogin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { credential, password } = req.body;
    console.log(credential, password);
    const user = yield dbclient_js_1.prisma.user.findFirst({
        where: {
            OR: [{ username: credential }, { email: credential }],
        },
    });
    if (!user || !bcryptjs_1.default.compareSync(password, user.hashedPassword)) {
        res.status(401);
        (0, response_js_1.sendResponse)(res, { message: 'Invalid credentials' });
        return;
    }
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };
    (0, auth_js_1.setTokenCookie)(res, safeUser);
    (0, response_js_1.sendResponse)(res, {
        user: Object.assign(Object.assign({}, safeUser), { firstName: user.firstName, lastName: user.lastName }),
    });
}));
router.delete('/', (_req, res) => {
    res.clearCookie('token');
    (0, response_js_1.sendResponse)(res, { message: 'success' });
});
router.get('/', (req, res) => {
    const { user } = req;
    if (user) {
        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        (0, response_js_1.sendResponse)(res, { user: safeUser });
    }
    else {
        (0, response_js_1.sendResponse)(res, { user: null });
    }
});
exports.default = router;
