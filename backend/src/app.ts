import cookieParser from 'cookie-parser';
import cors from 'cors';
import csurf from 'csurf';
import express, { Response, Request, NextFunction, RequestHandler } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import morgan from 'morgan';

import data from './config/index.js';
import { prisma } from './dbclient.js';
import routes from './routes/index.js';

declare global {
  namespace Express {
    interface Request {
      User?: any;
    }
  }
}

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
    sameSite: isProduction ? 'strict' as const : 'lax' as const,
    httpOnly: true,
  },
}) as unknown as RequestHandler;

app.use(csrfProtection);
app.use(routes);

export { app, prisma };