import express from "express";
import path from "path"; // Import path at the top
import api from "./api.js";
import { Request, Response } from 'express';

const router = express.Router();

router.use("/api", api);
// Determine if in production
const isProduction = process.env["NODE_ENV"] === "production";

// Serve React build files in production
if (isProduction) {
  // Serve the frontend's index.html file at the root route
  router.get("/", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return res.sendFile(path.resolve("../frontend", "dist", "index.html"));
  });

  // Serve the static assets in the frontend's build folder
  router.use(express.static(path.resolve("../frontend/dist")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return res.sendFile(path.resolve("../frontend", "dist", "index.html"));
  });
}


// Serve CSRF token for both development and production
router.get("/api/csrf/restore", (req: Request, res: Response) => {
  const csrfToken = req.csrfToken();
  console.log(csrfToken);
  res.cookie("XSRF-TOKEN", csrfToken); // Use the same cookie name
  return res.json({ "XSRF-Token": csrfToken });
});

router.get('/', async (req: Request, res: Response) => {
  // existing code
});

router.get('*', async (req: Request, res: Response) => {
  // existing code
});

export default router;
