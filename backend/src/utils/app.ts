import cookieParser from "cookie-parser";
import cors from "cors";
import csurf from "csurf";
import express, { RequestHandler } from "express";
import "express-async-errors";
import morgan from "morgan";

import data from "../config/index.js";
import { prisma } from "../dbclient.js";
import routes from "../routes/index.js";

const app = express();
const { environment } = data;
const isProduction = environment === "production";

// 1. Basic middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// 2. Security middleware
if (!isProduction) {
  app.use(
    cors({
      origin: "http://localhost:5000",
      credentials: true,
    })
  );
}
import helmet from 'helmet';
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. CSRF Protection
const csrfProtection = csurf({
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    httpOnly: true,
  },
}) as unknown as RequestHandler;

// 4. Routes
app.use((req, res, next) => {
  if (req.path === "/api/csrf/restore") {
    return next();
  }
  return csrfProtection(req, res, next);
});

app.get("/api/csrf/restore", (req, res) => {
  const token = req.csrfToken?.() || "";
  res.cookie("XSRF-TOKEN", token);
  res.json({ "XSRF-Token": token });
});

app.use(routes);

// 5. Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
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
  }
);

// Test Prisma connection
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((err: any) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

export { app, prisma };
