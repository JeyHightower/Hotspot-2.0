import bcrypt from 'bcryptjs';
import { Router } from 'express';
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
router.post('/', validateSignup, async (req, res, next) => {
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
        };
        setTokenCookie(res, safeUser);
        res.status(201);
        return res.json({
            user: { ...safeUser, firstName, lastName },
        });
    }
    catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            let fields = e.meta?.['target'];
            if (!(fields instanceof Array)) {
                throw Error('meta.target must be array');
            }
            let err = new Error('User already exists');
            err.message = 'User already exists';
            err.errors = {};
            const emailCh = (await prisma.user.count({ where: { email } })) === 1;
            const usernameCh = (await prisma.user.count({ where: { username } })) === 1;
            for (const { field, flag } of [
                { field: 'email', flag: emailCh },
                { field: 'username', flag: usernameCh },
            ]) {
                if (flag) {
                    err.errors[field] = `User with that ${field} already exists`;
                }
            }
            return next(err);
        }
        else {
            throw e;
        }
    }
});
export default router;
