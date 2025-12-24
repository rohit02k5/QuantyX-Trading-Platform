import { verifyToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

export const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyToken(token) as any;
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    (req as AuthenticatedRequest).userId = decoded.userId;
    next();
};
