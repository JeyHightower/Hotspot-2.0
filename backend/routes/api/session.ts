import { Router, Request, Response } from 'express';
import validator from 'express-validator';
import { handleValidationErrors } from '../../utils/validation.js';
import bcrypt from 'bcryptjs';
import { setTokenCookie, restoreUser } from '../../utils/auth.js';
import { prisma } from '../../dbclient.js';
import { sendResponse } from '../../utils/response.js';

const router = Router();

const validateLogin = [
  validator.body('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  validator.body('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors,
];

router.post('/', validateLogin, async (req: Request, res: Response) => {
  const { credential, password } = req.body;
  console.log(credential, password);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: credential }, { email: credential }],
    },
  });

  if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
    res.status(401);
    sendResponse(res, { message: 'Invalid credentials' });
    return;
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  setTokenCookie(res, safeUser);
  sendResponse(res, {
    user: { ...safeUser, firstName: user.firstName, lastName: user.lastName },
  });
});

router.delete('/', (_req: Request, res: Response) => {
  res.clearCookie('token');
  sendResponse(res, { message: 'success' });
});

router.get('/', (req: Request, res: Response) => {
  const { user } = req;
  if (user) {
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    sendResponse(res, { user: safeUser });
  } else {
    sendResponse(res, { user: null });
  }
});

export default router;