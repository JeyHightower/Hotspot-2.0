import { NextFunction, Request, Response, Router } from 'express';
import { check } from 'express-validator';
import { handleValidationErrors } from '../../utils/validation.js';

const router = Router();

import bcrypt from 'bcryptjs';
import { prisma } from '../../dbclient.js';
import { setTokenCookie } from '../../utils/auth.js';

const validateLogin = [
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { credential, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: credential }, { email: credential }],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      res.status(401);
      res.json({ message: 'Invalid credentials' });
      return;
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    setTokenCookie(res, safeUser);

    res.json({
      user: { ...safeUser, firstName: user.firstName, lastName: user.lastName },
    });
  },
);

router.delete('/', (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'success' });
});

router.get('/', (req: Request, res: Response): void => {
  const { user } = req;
  if (user) {
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    res.json({
      user: safeUser,
    });
  } else {
    res.json({ user: null });
  }
});

export default router;