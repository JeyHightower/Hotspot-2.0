"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_js_1 = require("../../utils/response.js");
const express_1 = require("express");
const validation_js_1 = require("../../utils/validation.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const auth_js_1 = require("../../utils/auth.js");
const dbclient_js_1 = require("../../dbclient.js");
const library_1 = require("@prisma/client/runtime/library");
const router = (0, express_1.Router)();
const validateSignup = [
    (0, express_validator_1.check)('email')
        .exists({ checkFalsy: true })
        .isLength({ max: 256 })
        .isEmail()
        .withMessage('Please provide a valid email at most 256 chars.'),
    (0, express_validator_1.check)('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters.'),
    (0, express_validator_1.check)('username')
        .exists({ checkFalsy: true })
        .isLength({ max: 30 })
        .withMessage('Please provide a username less than 30 characters.'),
    (0, express_validator_1.check)('username').not().isEmail().withMessage('Username cannot be an email.'),
    (0, express_validator_1.check)('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    (0, express_validator_1.check)('firstName')
        .exists({ checkFalsy: true })
        .withMessage('firstName must be passed'),
    (0, express_validator_1.check)('lastName')
        .exists({ checkFalsy: true })
        .withMessage('lastName must be passed'),
    validation_js_1.handleValidationErrors,
];
router.post('/', validateSignup, async (req, res) => {
    var _a;
    const { email, password, username, firstName, lastName } = req.body;
    const hashedPassword = bcryptjs_1.default.hashSync(password);
    try {
        const user = await dbclient_js_1.prisma.user.create({
            data: { email, username, hashedPassword, firstName, lastName },
        });
        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        (0, auth_js_1.setTokenCookie)(res, safeUser);
        res.status(201);
        (0, response_js_1.sendResponse)(res, {
            user: Object.assign(Object.assign({}, safeUser), { firstName, lastName }),
        });
    }
    catch (e) {
        if (e instanceof library_1.PrismaClientKnownRequestError) {
            let fields = (_a = e.meta) === null || _a === void 0 ? void 0 : _a['target'];
            if (!(fields instanceof Array)) {
                throw Error('meta.target must be array');
            }
            let err = new Error('User already exists');
            err.message = 'User already exists';
            err.errors = {};
            for (const field of fields) {
                err.errors[field] = `User with that ${field} already exists`;
            }
            throw err;
        }
        else {
            throw e;
        }
    }
});
exports.default = router;
