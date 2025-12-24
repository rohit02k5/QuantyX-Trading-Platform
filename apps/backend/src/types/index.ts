import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export interface OrderBody {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
}
