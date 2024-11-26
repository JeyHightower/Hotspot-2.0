import express from "express";
import { restoreUser } from "../utils/auth.js";
import sessionRouter from "./api/session.js";
import userRouter from "./api/users.js";
import spotRouter from "./api/spots.js";
import reviewRouter from "./api/reviews.js";
import bookingRouter from "./api/bookings.js";
import imagesRouter from "./api/images.js";

const router = express.Router();
router.use(restoreUser);

router.post("/test", (req, res) => {
res.json({ requestBody: req.body });
});


router.use("/spots", spotRouter);
router.use("/session", sessionRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/bookings", bookingRouter);
router.use(imagesRouter);


export default router;
