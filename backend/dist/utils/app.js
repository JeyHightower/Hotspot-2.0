"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const csurf_1 = __importDefault(require("csurf"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = __importDefault(require("../config/index.js"));
const dbclient_js_1 = require("../dbclient.js");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return dbclient_js_1.prisma; } });
const index_js_2 = __importDefault(require("../routes/index.js"));
const app = (0, express_1.default)();
exports.app = app;
const { environment } = index_js_1.default;
const isProduction = environment === "production";
// 1. Basic middleware
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// 2. Security middleware
if (!isProduction) {
    app.use((0, cors_1.default)({
        origin: isProduction ? 'https://your-production-url.com' : 'http://localhost:5173',
        credentials: true
    }));
}
// Import helmet at the top of the file with other imports
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// 3. CSRF Protection
app.use((0, csurf_1.default)({
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        httpOnly: true
    }
}));
// 4. Routes
app.use((req, res, next) => {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
    next();
});
app.get("/api/csrf/restore", (req, res) => {
    const token = req.csrfToken?.() || "";
    res.cookie("XSRF-TOKEN", token);
    res.json({ "XSRF-Token": token });
});
app.use(index_js_2.default);
// 5. Error handling
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        res.status(403).json({
            message: "Invalid CSRF token",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
        return;
    }
    console.error("Error:", err);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
// Test Prisma connection
dbclient_js_1.prisma
    .$connect()
    .then(() => {
    console.log("Successfully connected to database");
})
    .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});
