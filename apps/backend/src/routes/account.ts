import { Router } from 'express';
import { prisma } from 'numatix-database';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getAccountInfo } from '../utils/binance';

const router = Router();

router.get('/balance', authMiddleware, async (req: any, res: any) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId!;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // Local Wallet Management
        // 1. Initialize Default Liquidity
        const balances: Record<string, number> = {
            "USDT": 10000.00,
            "BTC": 1.00,
            "ETH": 10.00,
            "BNB": 20.00
        };

        // 2. Fetch processed order history
        const events = await prisma.orderEvent.findMany({
            where: {
                userId: userId,
                status: 'FILLED'
            },
            include: {
                order: true // Need to know the Symbol and Side
            }
        });

        // 3. Apply trades
        events.forEach(event => {
            const symbol = event.order.symbol;
            // Assuming simplified pairs like "BTCUSDT" -> Base: BTC, Quote: USDT
            // This regex splits loosely on the common quote assets
            let base = "";
            let quote = "USDT"; // Default fallback

            if (symbol.endsWith("USDT")) {
                base = symbol.replace("USDT", "");
                quote = "USDT";
            } else if (symbol.endsWith("BTC")) { // e.g. ETHBTC
                base = symbol.replace("BTC", "");
                quote = "BTC";
            }
            // Add other pairs if needed

            const qty = event.quantity;
            const price = event.price || 0;
            const cost = qty * price;

            if (event.order.side === 'BUY') {
                // Bought Base (Received +qty), Sold Quote (Paid -cost)
                balances[base] = (balances[base] || 0) + qty;
                balances[quote] = (balances[quote] || 0) - cost;
            } else {
                // Sold Base (Paid -qty), Bought Quote (Received +cost)
                balances[base] = (balances[base] || 0) - qty;
                balances[quote] = (balances[quote] || 0) + cost;
            }
        });

        // 4. Format as Binance Response
        // Binance returns: { balances: [ { asset: 'BTC', free: '0.000', locked: '0.000' }, ... ] }
        const formattedBalances = Object.entries(balances).map(([asset, amount]) => ({
            asset,
            free: amount.toFixed(8),
            locked: '0.00000000'
        }));

        res.json(formattedBalances);

    } catch (error: any) {
        console.error('Account Info Error:', error);
        res.status(500).json({ error: 'Failed to fetch account info' });
    }
});

export const accountRouter = router;
