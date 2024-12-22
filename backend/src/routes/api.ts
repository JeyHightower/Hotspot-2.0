import express from "express";
import { restoreUser } from "../utils/auth.js";
import bookingRouter from "./api/bookings.js";
import imagesRouter from "./api/images.js";
import reviewRouter from "./api/reviews.js";
import sessionRouter from "./api/session.js";
import * as spotRouter from "./api/spots.js";
import userRouter from "./api/users.js";

const router = express.Router();
router.use(restoreUser);

router.use("/spots", spotRouter.default);
router.use("/session", sessionRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/bookings", bookingRouter);
router.use(imagesRouter);
router.use("/api,apiRouter");
export default router;
