import express from "express";
import { restoreUser } from "../utils/auth";
import bookingRouter from "./api/bookings";
import imagesRouter from "./api/images";
import reviewRouter from "./api/reviews";
import sessionRouter from "./api/session";
import * as spotRouter from "./api/spots";
import userRouter from "./api/users";

const router = express.Router();
router.use(restoreUser);

router.use("/spots", spotRouter.default);
router.use("/session", sessionRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/bookings", bookingRouter);
router.use(imagesRouter);

export default router;
