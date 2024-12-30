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

// Static file serving in production
if (isProduction) {
  // Serve static files from the React app with proper MIME types
  app.use(
    express.static(path.join(__dirname, "../frontend/dist"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        } else if (filePath.endsWith(".html")) {
          res.setHeader("Content-Type", "text/html");
        }
      },
    })
  );
}

// 2. Security middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
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

// API routes
app.use(routes);

// Move catch-all route to the end, after API routes
if (isProduction) {
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"), (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Error serving static files");
      }
    });
  });
}

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
