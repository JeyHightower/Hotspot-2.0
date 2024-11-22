import express from "express";
const router = express.Router();
import { restoreUser } from "../utils/auth.js";
router.use(restoreUser);
import sessionRouter from "./api/session.js";
import userRouter from "./api/users.js";
import spotRouter from "./api/spots.js";
import reviewRouter from "./api/reviews.js";
import bookingRouter from "./api/bookings.js";
import imagesRouter from "./api/images.js";
router.use("/spots", spotRouter);
router.use("/session", sessionRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/bookings", bookingRouter);
router.use(imagesRouter);
router.post("/test", (req, res) => {
    res.json({ requestBody: req.body });
});
export default router;
//# sourceMappingURL=api.js.map