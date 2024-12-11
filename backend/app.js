"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
require("dotenv/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const csurf_1 = __importDefault(require("csurf"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = __importDefault(require("./config/index.js"));
const { environment } = index_js_1.default;
const isProduction = environment === 'production';
const app = (0, express_1.default)();
exports.app = app;
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
if (!isProduction) {
    app.use((0, cors_1.default)());
}
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'cross-origin' }));
const csrfProtection = (0, csurf_1.default)({
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        httpOnly: true,
    }
});
app.use(csrfProtection);
const library_1 = require("@prisma/client/runtime/library");
const dbclient_js_1 = require("./dbclient.js");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return dbclient_js_1.prisma; } });
const index_js_2 = __importDefault(require("./routes/index.js"));
app.use(index_js_2.default);
app.use(async (_req, _res, next) => {
    const err = new Error('Requested resource could not be found.');
    err.title = 'Resource not found';
    err.errors = { message: "The requested resource couldn't be found" };
    err.status = 404;
    next(err);
});
// @ts-ignore
app.use((err, _req, _res, next) => {
    if (err instanceof library_1.PrismaClientValidationError) {
        err.title = 'prisma validation error';
        err.errors = err.message;
    }
    next(err);
});
// @ts-ignore
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    const resp = {
        message: err.message,
        errors: err.errors,
    };
    if (!isProduction) {
        (resp.title = err.title || 'Server Error'), (resp.stack = err.stack);
    }
    res.json(resp);
});
const port = process.env.PORT || 5005;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
