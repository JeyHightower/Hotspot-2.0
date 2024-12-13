import { Router } from 'express';
import { check } from 'express-validator';
import { handleValidationErrors } from '../../utils/validation.js';
const router = Router();
import bcrypt from 'bcryptjs';
import { prisma } from '../../dbclient.js';
import { setTokenCookie } from '../../utils/auth.js';
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
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
router.post('/', validateLogin, asyncHandler(async (req, res) => {
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
    await setTokenCookie(res, safeUser);
    return res.json({
        user: { ...safeUser, firstName: user.firstName, lastName: user.lastName },
    });
}));
router.delete('/', asyncHandler((_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
}));
router.get('/', asyncHandler(async (req, res) => {
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
    }
    else
        return res.json({ user: null });
}));
export default router;