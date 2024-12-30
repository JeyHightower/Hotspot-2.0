import cookieParser from "cookie-parser";
import cors from "cors";
import csurf from "csurf";
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import "express-async-errors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { prismaClient as prisma } from "./prismaClient";

import data from "./config";
import routes from "./routes/index";
const app = express();
const { environment } = data;
const isProduction = environment === "production";

// 1. Basic middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// 2. Security middleware
app.use(
  cors({
    origin: isProduction
      ? "https://your-production-url.com"
      : "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// 3. CSRF Protection
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      httpOnly: true,
    },
  }) as unknown as RequestHandler
);

// 4. Routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.csrfToken();
  res.cookie("XSRF-TOKEN", token);
  next();
});

app.get("/api/csrf/restore", (req: Request, res: Response) => {
  const token = req.csrfToken();
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

export { app, prisma };
