import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check } from 'express-validator';
import { handleValidationErrors } from '../../utils/validation.js';

const router = Router();

import bcrypt from 'bcryptjs';
import { prisma } from '../../dbclient.js';
import { setTokenCookie } from '../../utils/auth.js';


const asyncHandlerSession = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors,
];

router.post(
  '/',
  validateLogin,
  asyncHandlerSession(async (req: Request, res: Response) => {
    const { credential, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: credential }, { email: credential }],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      res.status(401);
      return res.json({ message: 'Invalid credentials' });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };


    setTokenCookie(res, safeUser);






    return res.json({
      user: { ...safeUser, firstName: user.firstName, lastName: user.lastName },
    });
  })
);

router.delete('/', asyncHandlerSession((_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'success' });
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { user } = req;
  if (user) {
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return res.json({
      user: safeUser,
    });
  } else return res.json({ user: null });
}));

export default router;
function asyncHandler(arg0: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>) {
  throw new Error('Function not implemented.');
}

