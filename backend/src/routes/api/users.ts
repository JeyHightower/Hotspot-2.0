import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import { check } from 'express-validator';
import { handleValidationErrors } from '../../utils/validation.js';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../dbclient.js';
import { setTokenCookie } from '../../utils/auth.js';

const router = Router();

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isLength({ max: 256 })
    .isEmail()
    .withMessage('Please provide a valid email at most 256 chars.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ max: 30 })
    .withMessage('Please provide a username less than 30 characters.'),
  check('username').not().isEmail().withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('firstName must be passed'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('lastName must be passed'),
  handleValidationErrors,
];

router.post(
  '/',
  validateSignup,

  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, username, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 2);

    try {
      const user = await prisma.user.create({
        data: { email, username, hashedPassword, firstName, lastName },
      });

      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        hashedPassword: user.hashedPassword,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await setTokenCookie(res, safeUser);
      res.json({ user: safeUser });
    } catch (e: unknown) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          res.status(500).json({
            message: 'User already exists',
            errors: { email: 'User with that email already exists' },
          });
          return;
        }
      }
      if (e instanceof Error) {
        next(e);
      } else {
        next(new Error('An unknown error occurred'));
      }
    }
  }  );
  export default router;


