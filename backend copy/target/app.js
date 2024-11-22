import express from "express";
import "express-async-errors";
import morgan from "morgan";
import cors from "cors";
import csurf from "csurf";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import data from "./config/index.js";
import { prisma } from "./dbclient.js";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import routes from "./routes/index.js";
const { environment } = data;
const isProduction = environment === "production";
const app = express();
app.use(morgan("dev"));
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
app.use(async (_req, _res, next) => {
    const err = new Error("Requested resource could not be found.");
    err.title = "Resource not found";
    err.errors = { message: "The requested resource couldn't be found" };
    err.status = 404;
    next(err);
});
// @ts-ignore
app.use((err, _req, _res, next) => {
    if (err instanceof PrismaClientValidationError) {
        err.title = "prisma validation error";
        err.errors = err.message;
    }
    next(err);
});
// @ts-ignore
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    const resp = {
        message: err.message,
        errors: err.errors,
    };
    if (!isProduction) {
        (resp.title = err.title || "Server Error"), (resp.stack = err.stack);
    }
    res.json(resp);
});
export { app, prisma };
//# sourceMappingURL=app.js.map