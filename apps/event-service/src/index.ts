import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3003');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// Redis Subscriber
const redisSubscriber = new Redis(REDIS_URL);

// Connected Clients Map: UserId -> Set<WebSocket>
const clients = new Map<string, Set<WebSocket>>();

const wss = new WebSocketServer({ port: PORT });
console.log(`Event Service (WebSocket) running on port ${PORT}`);

// Auth Helper
const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Extract token from query param ?token=...
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
        ws.close(1008, 'Token required');
        return;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
        ws.close(1008, 'Invalid token');
        return;
    }

    const userId = decoded.userId;

    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    clients.get(userId)?.add(ws);

    console.log(`User connected: ${userId}`);

    ws.on('close', () => {
        const userClients = clients.get(userId);
        userClients?.delete(ws);
        if (userClients?.size === 0) {
            clients.delete(userId);
        }
        console.log(`User disconnected: ${userId}`);
    });

    ws.on('error', console.error);
});

// Redis Listener
redisSubscriber.subscribe('events:order:status', (err) => {
    if (err) console.error('Failed to subscribe to Redis:', err);
    else console.log('Subscribed to events:order:status');
});

redisSubscriber.on('message', (channel, message) => {
    if (channel === 'events:order:status') {
        try {
            const event = JSON.parse(message);
            const userId = event.userId;

            if (clients.has(userId)) {
                const payload = JSON.stringify({
                    type: 'ORDER_UPDATE',
                    data: event
                });

                clients.get(userId)?.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(payload);
                    }
                });
                console.log(`Broadcasted event to user ${userId}`);
            }
        } catch (error) {
            console.error('Error handling Redis message:', error);
        }
    }
});
