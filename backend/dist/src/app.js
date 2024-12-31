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
const path_1 = __importDefault(require("path"));
const prismaClient_1 = require("./prismaClient");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prismaClient_1.prismaClient; } });
const config_1 = __importDefault(require("./config"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
exports.app = app;
const { environment } = config_1.default;
const isProduction = environment === "production";
// 1. Basic middleware
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Static file serving in production
if (isProduction) {
    // Serve static files from the React app with proper MIME types
    app.use(express_1.default.static(path_1.default.join(__dirname, "../frontend/dist"), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".js")) {
                res.setHeader("Content-Type", "application/javascript");
            }
            else if (filePath.endsWith(".css")) {
                res.setHeader("Content-Type", "text/css");
            }
            else if (filePath.endsWith(".html")) {
                res.setHeader("Content-Type", "text/html");
            }
        },
    }));
}
// 2. Security middleware
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
        policy: "cross-origin",
    },
}));
// 3. CSRF Protection
app.use((0, csurf_1.default)({
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        httpOnly: true,
    },
}));
// 4. Routes
app.use((req, res, next) => {
    const token = req.csrfToken();
    res.cookie("XSRF-TOKEN", token);
    next();
});
app.get("/api/csrf/restore", (req, res) => {
    const token = req.csrfToken();
    res.cookie("XSRF-TOKEN", token);
    res.json({ "XSRF-Token": token });
});
// API routes
app.use(index_1.default);
// Move catch-all route to the end, after API routes
if (isProduction) {
    app.get("*", (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith("/api")) {
            return next();
        }
        res.sendFile(path_1.default.join(__dirname, "../frontend/dist/index.html"), (err) => {
            if (err) {
                console.error("Error serving index.html:", err);
                res.status(500).send("Error serving static files");
            }
        });
    });
}
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
prismaClient_1.prismaClient
    .$connect()
    .then(() => {
    console.log("Successfully connected to database");
})
    .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});
//# sourceMappingURL=app.js.map