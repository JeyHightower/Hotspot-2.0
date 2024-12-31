"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../utils/auth");
const bookings_1 = __importDefault(require("./api/bookings"));
const images_1 = __importDefault(require("./api/images"));
const reviews_1 = __importDefault(require("./api/reviews"));
const session_1 = __importDefault(require("./api/session"));
const spots_1 = __importDefault(require("./api/spots"));
const users_1 = __importDefault(require("./api/users"));
const router = express_1.default.Router();
router.use(auth_1.restoreUser);
router.use("/spots", spots_1.default);
router.use("/session", session_1.default);
router.use("/users", users_1.default);
router.use("/reviews", reviews_1.default);
router.use("/bookings", bookings_1.default);
router.use(images_1.default);
exports.default = router;
//# sourceMappingURL=api.js.map