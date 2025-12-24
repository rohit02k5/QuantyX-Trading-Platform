import { describe, it, expect } from 'vitest';
import { orderSchema } from '../routes/order';

describe('Order Schema Validation', () => {
    it('should validate a correct limit buy order', () => {
        const order = {
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            quantity: 0.1,
            price: 50000
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
    });

    it('should fail limit order without price', () => {
        const order = {
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            quantity: 0.1
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(false);
    });

    it('should validate market order without price', () => {
        const order = {
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'MARKET',
            quantity: 0.1
        };
        const result = orderSchema.safeParse(order);
        expect(result.success).toBe(true);
    });
});
