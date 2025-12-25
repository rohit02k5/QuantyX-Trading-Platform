import { Router, Request, Response } from 'express';
import { prisma } from 'numatix-database';
import Redis from 'ioredis';
import { CONFIG } from '../config';
import { verifyToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod'; // Bonus Feature: Input Validation
import rateLimit from 'express-rate-limit'; // Bonus Feature: Rate Limiting

const router = Router();
const redis = new Redis(CONFIG.REDIS_URL);

import { authMiddleware } from '../middleware/auth';

// Bonus: Rate Limiter (10 orders per minute for now)
const orderLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many orders, please slow down"
});

// Bonus: Zod Schema
export const orderSchema = z.object({
    symbol: z.string().min(1),
    side: z.enum(['BUY', 'SELL']),
    type: z.enum(['LIMIT', 'MARKET', 'STOP_MARKET']),
    quantity: z.number().positive(),
    price: z.number().positive().optional(),
    stopPrice: z.number().positive().optional()
}).refine(data => {
    if ((data.type === 'LIMIT' || data.type === 'STOP_MARKET') && !data.price) return false;
    if (data.type === 'STOP_MARKET' && !data.stopPrice) return false;
    return true;
}, { message: "Price/StopPrice required for Limit/Stop orders" });

router.post('/orders', authMiddleware, orderLimiter, async (req: Request, res: Response) => {
    try {
        const validation = orderSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.issues });
        }

        const authReq = req as AuthenticatedRequest;
        const { symbol, side, type, quantity, price, stopPrice } = validation.data;
        const userId = authReq.userId!;

        // 1. Create OrderCommand in DB (PENDING)
        const order = await prisma.orderCommand.create({
            data: {
                userId,
                symbol,
                side,
                type,
                quantity: quantity,
                price: price || null,
                status: 'PENDING'
            } // Note: stoppingPrice not in DB schema yet, but logic can use it if we add column or ignoring for MVP
        });

        // 2. Publish to Redis
        const command = {
            orderId: order.id,
            userId,
            symbol,
            side,
            type,
            quantity,
            price,
            stopPrice,
            timestamp: new Date().toISOString()
        };

        console.log('Publishing to Redis:', JSON.stringify(command));
        await redis.publish('commands:order:submit', JSON.stringify(command));
        console.log(`Published order command: ${order.id}`);

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

router.get('/orders', authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) return res.sendStatus(401);

    const orders = await prisma.orderCommand.findMany({
        where: { userId: authReq.userId },
        orderBy: { createdAt: 'desc' },
        include: { events: true }
    });
    res.json(orders);
});

router.get('/positions', authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userId) return res.sendStatus(401);

    const userId = authReq.userId;

    // Simple position calculation aggregation
    // For optimizations, let's fetch orders with events
    const userOrders = await prisma.orderCommand.findMany({
        where: { userId: userId, status: 'PROCESSED' }, // Or check filled events
        include: { events: true }
    });

    const positions: Record<string, number> = {};

    userOrders.forEach((order: any) => {
        const filled = order.events.find((e: any) => e.status === 'FILLED');
        if (!filled) return;

        if (!positions[order.symbol]) positions[order.symbol] = 0;
        if (order.side === 'BUY') {
            positions[order.symbol] += filled.quantity;
        } else {
            positions[order.symbol] -= filled.quantity;
        }
    });

    // Convert to array
    const posArray = Object.entries(positions).map(([symbol, size]) => ({ symbol, size }));

    res.json(posArray);
});

router.delete('/orders/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId!;
        const orderId = req.params.id;

        const order = await prisma.orderCommand.findUnique({
            where: { id: orderId }
        });

        if (!order || order.userId !== userId) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (['FILLED', 'CANCELED', 'REJECTED'].includes(order.status)) {
            return res.status(400).json({ error: 'Cannot cancel closed order' });
        }

        // Publish to Redis
        const command = {
            orderId: order.id,
            userId,
            symbol: order.symbol,
            timestamp: new Date().toISOString()
        };

        console.log('Publishing Cancel to Redis:', JSON.stringify(command));
        await redis.publish('commands:order:cancel', JSON.stringify(command));

        res.json({ message: 'Cancellation submitted', orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

export const orderRouter = router;
