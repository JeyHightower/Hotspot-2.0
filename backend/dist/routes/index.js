"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./api"));
const router = express_1.default.Router();
router.use("/api", api_1.default);
router.get("/test", (req, res) => {
    res.json({ message: "API is working!" });
});
// API routes
router.get("/api/csrf/restore", (req, res) => {
    var _a;
    const token = ((_a = req.csrfToken) === null || _a === void 0 ? void 0 : _a.call(req)) || "";
    res.cookie("XSRF-TOKEN", token);
    res.json({ "XSRF-Token": token });
});
// Serve the frontend's index.html file at the root route
router.get("/", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return res.sendFile(path_1.default.resolve("../frontend", "dist", "index.html"));
});
// Serve the static assets in the frontend's build folder
router.use(express_1.default.static(path_1.default.resolve("../frontend/dist")));
// Serve the frontend's index.html file at all other routes NOT starting with /api
router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return res.sendFile(path_1.default.resolve("../frontend", "dist", "index.html"));
});
exports.default = router;
