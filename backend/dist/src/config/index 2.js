"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = {
    environment: process.env["NODE_ENV"] || "development",
    port: process.env["PORT"] || 5000,
    dbFile: process.env["DB_FILE"],
    jwtConfig: {
        secret: process.env["JWT_SECRET"],
        expiresIn: process.env["JWT_EXPIRES_IN"],
    },
    isProduction: false,
};
data.isProduction = data.environment === "production";
exports.default = data;
