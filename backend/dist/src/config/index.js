"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 8000,
    dbFile: process.env.DB_FILE,
    database: {
        url: process.env.DATABASE_URL,
    },
    jwtConfig: {
        secret: process.env.JWT_SECRET || "super-secret-key",
        expiresIn: process.env.JWT_EXPIRES_IN || 604800,
    },
    isProduction: process.env.NODE_ENV === "production",
};
//# sourceMappingURL=index.js.map