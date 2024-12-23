import * as dotenv from "dotenv";
dotenv.config();

const config = {
  environment: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
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

export default config;
