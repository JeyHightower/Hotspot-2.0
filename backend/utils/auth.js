"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTokenCookie = setTokenCookie;
exports.restoreUser = restoreUser;
exports.requireAuth = requireAuth;
// backend/utils/auth.js
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = __importDefault(require("../config/index.js"));
const dbclient_js_1 = require("../dbclient.js");
const { jwtConfig } = index_js_1.default;
const { secret: secretRaw, expiresIn: expiresInStr } = jwtConfig;
const err = () => {
    throw Error('no secret');
};
const expiresIn = parseInt(expiresInStr);
const secret = secretRaw || err();
function setTokenCookie(res, user) {
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };
    const token = jsonwebtoken_1.default.sign({ data: safeUser }, secret, { expiresIn });
    res.cookie('token', token, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: index_js_1.default.isProduction,
        sameSite: index_js_1.default.isProduction && 'lax',
    });
    return token;
}
function restoreUser(req, res, next) {
    let token = null;
    if ('token' in req.cookies) {
        token = req.cookies['token'];
    }
    return jsonwebtoken_1.default.verify(token !== null && token !== void 0 ? token : '', secret, {}, async (err, jwtPayload) => {
        if (err) {
            return next();
        }
        try {
            const { id } = jwtPayload.data;
            req.user = await dbclient_js_1.prisma.user.findUnique({ where: { id: id } });
        }
        catch (e) {
            res.clearCookie('token');
            return next();
        }
        if (!req.user)
            res.clearCookie('token');
        return next();
    });
}
function requireAuth(req, _res, next) {
    if (req.user)
        return next();
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
}
