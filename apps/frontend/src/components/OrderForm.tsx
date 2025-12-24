"use client";
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface OrderFormProps {
    symbol: string;
}

export default function OrderForm({ symbol }: OrderFormProps) {
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [type, setType] = useState<'LIMIT' | 'MARKET' | 'STOP_MARKET'>('LIMIT');
    const [price, setPrice] = useState('');
    const [stopPrice, setStopPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    const [availableBalance, setAvailableBalance] = useState('0.00');
    const [baseBalance, setBaseBalance] = useState('0.00'); // Asset balance (e.g. BTC)
    const [quoteBalance, setQuoteBalance] = useState('0.00'); // Quote balance (e.g. USDT)

    const [loading, setLoading] = useState(false);

    // Fetch Balance
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await api.get('/account/balance');
                const balances = res.data;
                const baseAsset = symbol.replace('USDT', '');
                const quoteAsset = 'USDT';

                const base = balances.find((b: any) => b.asset === baseAsset);
                const quote = balances.find((b: any) => b.asset === quoteAsset);

                if (base) setBaseBalance(base.free);
                if (quote) setQuoteBalance(quote.free);
            } catch (err) {
                console.error('Failed to fetch balance', err);
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [symbol]);

    useEffect(() => {
        setAvailableBalance(side === 'BUY' ? quoteBalance : baseBalance);
    }, [side, baseBalance, quoteBalance]);


    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return; // Ignore if typing in input

            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                setSide('BUY');
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                setSide('SELL');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const setPercentage = (pct: number) => {
        const balance = parseFloat(availableBalance) || 0;

        let effectiveBalance = balance;
        if (balance === 0) {
            // Apply simulated liquidity for zero-balance testing
            effectiveBalance = side === 'BUY' ? 10000 : 1;
            toast('Simulated Balance Active', { icon: 'ℹ️' });
        }

        let qty = 0;
        if (side === 'SELL') {
            qty = effectiveBalance * pct;
        } else {
            const p = parseFloat(price) || 65000;
            const quoteAmount = effectiveBalance * pct;
            qty = quoteAmount / p;
        }

        const finalQty = qty.toFixed(5);
        setQuantity(finalQty);
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Submitting order:', { symbol, side, type, quantity, price, stopPrice });
            const res = await api.post('/trading/orders', {
                symbol,
                side,
                type,
                quantity: parseFloat(quantity),
                price: (type === 'LIMIT' || type === 'STOP_MARKET') && price ? parseFloat(price) : undefined,
                stopPrice: type === 'STOP_MARKET' ? parseFloat(stopPrice) : undefined,
            });
            console.log('Order placed successfully:', res.data);
            toast.success('Order Submitted Successfully');
            setQuantity('');
            // Don't clear price for Limit orders usually, but okay for now
        } catch (err: any) {
            console.error('Order submission failed:', err);
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card w-full h-full flex flex-col border-l border-border">
            {/* Header / Tabs */}
            <div className="flex p-4 gap-2">
                <div className="flex bg-input p-1 rounded-md w-full relative">
                    {/* Dynamic Background Layer */}
                    <button
                        onClick={() => setSide('BUY')}
                        className={`flex-1 py-2 text-sm font-bold rounded transition-all duration-200 ${side === 'BUY' ? 'bg-buy text-white shadow-md' : 'text-muted hover:text-foreground'}`}
                    >
                        Buy
                    </button>
                    <button
                        onClick={() => setSide('SELL')}
                        className={`flex-1 py-2 text-sm font-bold rounded transition-all duration-200 ${side === 'SELL' ? 'bg-sell text-white shadow-md' : 'text-muted hover:text-foreground'}`}
                    >
                        Sell
                    </button>
                </div>
            </div>

            <div className="px-4 flex gap-4 text-xs font-bold text-muted border-b border-border pb-2 mb-4">
                <button onClick={() => setType('LIMIT')} className={`hover:text-primary transition-colors ${type === 'LIMIT' ? 'text-primary' : ''}`}>Limit</button>
                <button onClick={() => setType('MARKET')} className={`hover:text-primary transition-colors ${type === 'MARKET' ? 'text-primary' : ''}`}>Market</button>
                <button onClick={() => setType('STOP_MARKET')} className={`hover:text-primary transition-colors ${type === 'STOP_MARKET' ? 'text-primary' : ''}`}>Stop Limit</button>
            </div>

            <form onSubmit={handleSubmit} className="px-4 flex-1 flex flex-col gap-4">

                {/* Available Balance */}
                <div className="flex justify-between text-xs text-muted font-mono">
                    <span>Avbl</span>
                    <span className="text-foreground">{parseFloat(availableBalance).toFixed(4)} {side === 'BUY' ? 'USDT' : symbol.replace('USDT', '')}</span>
                </div>

                {/* Stop Price Field */}
                {type === 'STOP_MARKET' && (
                    <div className="trade-input-group h-10 px-3">
                        <span className="text-muted text-xs w-12 text-left">Stop</span>
                        <input
                            type="number"
                            value={stopPrice}
                            onChange={(e) => setStopPrice(e.target.value)}
                            className="flex-1 bg-transparent text-right text-sm font-mono outline-none text-foreground placeholder-gray-600"
                            placeholder="Trigger"
                            step="0.01"
                        />
                        <span className="text-muted text-xs pl-2">USDT</span>
                    </div>
                )}

                {/* Price Field */}
                {(type === 'LIMIT' || type === 'STOP_MARKET') && (
                    <div className="trade-input-group h-10 px-3">
                        <span className="text-muted text-xs w-12 text-left">Price</span>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="flex-1 bg-transparent text-right text-sm font-mono outline-none text-foreground placeholder-gray-600"
                            placeholder="0.00"
                            step="0.01"
                        />
                        <span className="text-muted text-xs pl-2">USDT</span>
                    </div>
                )}

                {/* Market Price Placeholder */}
                {type === 'MARKET' && (
                    <div className="trade-input-group h-10 px-3 bg-input/50 cursor-not-allowed border-transparent">
                        <span className="text-muted text-xs w-12 text-left">Price</span>
                        <input disabled value="Market Price" className="flex-1 bg-transparent text-right text-sm outline-none text-muted-foreground cursor-not-allowed" />
                        <span className="text-muted text-xs pl-2">USDT</span>
                    </div>
                )}

                {/* Quantity Field */}
                <div className="trade-input-group h-10 px-3">
                    <span className="text-muted text-xs w-12 text-left">Amount</span>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="flex-1 bg-transparent text-right text-sm font-mono outline-none text-foreground placeholder-gray-600"
                        placeholder="Min 0.001"
                        step="0.0001"
                    />
                    <span className="text-muted text-xs pl-2">BTC</span>
                </div>

                {/* Percent Slider (Visual Only for now / Custom) */}
                <div className="flex justify-between gap-1 mt-1">
                    {[0.25, 0.50, 0.75, 1].map((pct) => (
                        <button
                            key={pct}
                            type="button"
                            onClick={() => setPercentage(pct)}
                            className="flex-1 bg-input hover:bg-input/80 py-1 rounded-[2px] text-[10px] text-muted hover:text-primary transition-colors"
                        >
                            {pct * 100}%
                        </button>
                    ))}
                </div>


                {/* Total (Simulated) */}
                <div className="trade-input-group h-10 px-3 mt-2 border-transparent">
                    <span className="text-muted text-xs w-12 text-left">Total</span>
                    <div className="flex-1 text-right text-sm font-mono text-foreground">
                        {(type === 'MARKET')
                            ? 'Est. Market'
                            : (quantity && price ? (parseFloat(quantity) * parseFloat(price)).toFixed(2) : '0.00')
                        }
                    </div>
                    <span className="text-muted text-xs pl-2">USDT</span>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-md font-bold text-sm mt-4 transition-all duration-200 transform active:scale-[0.98] ${side === 'BUY'
                        ? 'bg-buy hover:opacity-90 shadow-[0_0_15px_rgba(14,203,129,0.3)]'
                        : 'bg-sell hover:opacity-90 shadow-[0_0_15px_rgba(246,70,93,0.3)]'
                        } text-white`}
                >
                    {loading ? (
                        <span className="animate-pulse">Submitting...</span>
                    ) : (
                        `${side} ${symbol.replace('USDT', '')}`
                    )}
                </button>
            </form>

            <div className="mt-auto p-4 space-y-3 text-xs text-muted border-t border-border">
                <div className="flex justify-between">
                    <span>Margin Ratio</span>
                    <span className="text-green-500 font-mono">0.00%</span>
                </div>
                <div className="flex justify-between">
                    <span>Maintenance Margin</span>
                    <span className="font-mono">0.00 USDT</span>
                </div>
                <div className="flex justify-between">
                    <span>Assets</span>
                    <span className="font-mono">{parseFloat(quoteBalance).toFixed(2)} USDT</span>
                </div>
            </div>
        </div>
    );
}
