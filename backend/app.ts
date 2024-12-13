import cookieParser from 'cookie-parser';
import cors from 'cors';
import csurf from 'csurf';
import express, { Response, Request, NextFunction, RequestHandler } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import morgan from 'morgan';

import data from './config/index.js';

declare global {
  namespace Express {
    interface Request {
      User?: any;
    }
  }
}


type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any> | any;


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

const csrfOptions = {
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    httpOnly: true,
  },
};
const csrfProtection = csurf({
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'strict' as const : 'lax' as const,
    httpOnly: true,
  },
}) as unknown as RequestHandler;


app.use(csrfProtection);

import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { prisma } from './dbclient.js';

import routes from './routes/index.js';

app.use(routes);

declare global {
  export interface Error {
    title?: string;
    status?: number;
    errors?: { [key: string]: any };
  }
}

app.use(async (_req, _res, next) => {
  const err = new Error('Requested resource could not be found.') as Error & {
    title: string;
    errors: { message: string };
    status: number;
  };
  err.title = 'Resource not found';
  err.errors = { message: "The requested resource couldn't be found" };
  err.status = 404;
  next(err);
});

app.use((err: any, _req: any, _res: any, next: any) => {
  if (err instanceof PrismaClientValidationError) {
    err.title = 'prisma validation error';
    err.errors = { message: err.message };
  }
  next(err);
});

app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.status || 500);
  console.error(err);
  const resp: {
    title?: any;
    message: any;
    errors: any;
    stack?: any;
  } = {
    message: err.message,
    errors: err.errors,
  };

  if (!isProduction) {
    resp.title = err.title || 'Server Error';
    resp.stack = err.stack;
  }

  res.json(resp);
});

export { app, prisma };