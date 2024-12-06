import express from "express";
import "express-async-errors";
import morgan from "morgan";
import cors from "cors";
import csurf from "csurf";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import data from "./config/index.js";
import { prisma } from "./dbclient.js";
import routes from "./routes/index.js";
const { environment } = data;
const isProduction = environment === "production";
const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
if (!isProduction) {
    app.use(cors());
}
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(csurf({
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? "lax" : false,
        httpOnly: true,
    },
}));
app.use(routes);
app.get("/api/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF_TOKEN", csrfToken);
    return res.json({ "XSRF-Token": csrfToken });
});
// Update route handlers
app.use((_req, _res, next) => {
    next(createError(404));
});
app.use((err, req, res, _next) => {
    res.locals["message"] = err['message'];
    res.locals["error"] = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
});
export { app, prisma };
