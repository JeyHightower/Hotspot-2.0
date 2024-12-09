import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import csurf from 'csurf';
import helmet from 'helmet';
import morgan from 'morgan';
import data from './config/index.js';
const { environment } = data;
const isProduction = environment === 'production';
const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
if (!isProduction) {
    app.use(cors());
}
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
const csrfProtection = csurf({
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        httpOnly: true,
    }
});
app.use(csrfProtection);
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { prisma } from './dbclient.js';
import routes from './routes/index.js';
app.use(routes);
app.use(async (_req, _res, next) => {
    const err = new Error('Requested resource could not be found.');
    err.title = 'Resource not found';
    err.errors = { message: "The requested resource couldn't be found" };
    err.status = 404;
    next(err);
});
// @ts-ignore
app.use((err, _req, _res, next) => {
    if (err instanceof PrismaClientValidationError) {
        err.title = 'prisma validation error';
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
        (resp.title = err.title || 'Server Error'), (resp.stack = err.stack);
    }
    res.json(resp);
});
export { app, prisma };
//# sourceMappingURL=app.js.map