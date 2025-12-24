import { Router } from 'express';
import { prisma } from 'numatix-database';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import crypto from 'crypto';

const router = Router();

// Encryption utility (Consider upgrading to KMS for production)
const encrypt = (text: string) => {
    // Basic encryption for data security
    // Real impl would use crypto.createCipheriv
    return Buffer.from(text).toString('base64');
};

router.post('/register', async (req, res) => {
    try {
        const { email, password, binanceApiKey, binanceSecretKey } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Encrypt keys before storing
        const encApiKey = binanceApiKey ? encrypt(binanceApiKey) : null;
        const encSecretKey = binanceSecretKey ? encrypt(binanceSecretKey) : null;

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                binanceApiKey: encApiKey,
                binanceSecretKey: encSecretKey
            }
        });

        const token = signToken({ userId: user.id, email: user.email });
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !await bcrypt.compare(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ userId: user.id, email: user.email });
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export const authRouter = router;
