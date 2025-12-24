"use client";
import { useEffect, useState, useRef } from 'react';
import Header from '../../../components/Header';
import OrderForm from '../../../components/OrderForm';
import Chart from '../../../components/Chart';
import PositionsTable from '../../../components/PositionsTable';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';
import { OrderEvent } from '../../../types';
import toast from 'react-hot-toast';
import ErrorBoundary from '../../../components/ErrorBoundary';

export default function TradePage({ params }: { params: { symbol: string } }) {
    const { token, user, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const symbol = params.symbol.toUpperCase();
    const [events, setEvents] = useState<OrderEvent[]>([]);
    const [interval, setInterval] = useState('1m');
    const [alertPrice, setAlertPrice] = useState('');
    const [alertEnabled, setAlertEnabled] = useState(false);
    const lastPriceRef = useRef<number>(0);

    // WebSocket for User Events & Price Ticker (Mocking Ticker via Kline for simplicity or reusing ws)
    useEffect(() => {
        if (!token) return;

        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            ws = new WebSocket(`ws://localhost:3003?token=${token}`);

            ws.onopen = () => console.log('User WS Connected');

            ws.onmessage = (msg) => {
                const data = JSON.parse(msg.data);

                if (data.type === 'ORDER_UPDATE') {
                    console.log('Order Update:', data.data);
                    setEvents(prev => {
                        // Deduplicate by orderId or id
                        const exists = prev.some(e => e.id === data.data.id || e.orderId === data.data.orderId);
                        if (exists) return prev;
                        return [...prev, data.data];
                    });

                    if (data.data.status === 'FILLED') {
                        toast.success(`Order Filled: ${data.data.side} ${data.data.quantity} @ ${data.data.price}`);
                        // Update last price ref for alert check if we trust this as price source, 
                        // but better to rely on Chart WS for price. 
                        // However, let's use the Order Update price as a proxy for now or just the fill.
                        if (data.data.price) lastPriceRef.current = data.data.price;
                    } else if (data.data.status === 'CANCELED') {
                        toast('Order Canceled', { icon: '🚫' });
                    }
                }
            };
            ws.onclose = () => {
                console.log('User WS Closed');
                reconnectTimeout = setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.onclose = null; // Prevent reconnect loop on cleanup
                ws.close();
            }
        };
    }, [token]);

    // Independent Effect for Price Monitoring (using Chart WS would be ideal but inaccessible here easily)
    // Let's add a robust Price Alert check inside the Chart component instead? 
    // No, let's pass a callback to Chart or lift state up.
    // EASIEST: Pass `onPriceUpdate` to Chart.

    const handlePriceUpdate = (price: number) => {
        // Always track the last price to detect crossovers correctly
        // If it's the first price (0), just initialize it
        if (lastPriceRef.current === 0) {
            lastPriceRef.current = price;
            return;
        }

        if (alertEnabled && alertPrice) {
            const target = parseFloat(alertPrice);
            const prev = lastPriceRef.current;

            // Cross Up: Prev < Target && Curr >= Target
            const crossUp = prev < target && price >= target;

            // Cross Down: Prev > Target && Curr <= Target
            const crossDown = prev > target && price <= target;

            if (crossUp || crossDown) {
                toast.success(`Price Alert: ${crossUp ? 'Crossed Up' : 'Crossed Down'} ${target}!`, {
                    icon: '🔔',
                    duration: 5000,
                    style: {
                        background: '#1E2026',
                        color: '#fff',
                        border: '1px solid #FCD535'
                    }
                });
                setAlertEnabled(false);
            }
        }

        lastPriceRef.current = price;
    };

    if (!user) return null;

    return (
        <ErrorBoundary>
            <div className="min-h-screen flex flex-col bg-background">
                <Header />

                <main className="flex-1 flex gap-1 p-1 overflow-hidden">
                    {/* Left: Chart & Positions */}
                    <div className="flex-1 flex flex-col gap-1 w-3/4">
                        <div className="flex items-center justify-between bg-card p-4 rounded-t">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={symbol}
                                        onChange={(e) => router.push(`/trade/${e.target.value}`)}
                                        className="bg-transparent text-2xl font-bold text-foreground outline-none cursor-pointer appearance-none hover:text-primary"
                                    >
                                        <option value="BTCUSDT" className="bg-card">BTC/USDT</option>
                                        <option value="ETHUSDT" className="bg-card">ETH/USDT</option>
                                        <option value="BNBUSDT" className="bg-card">BNB/USDT</option>
                                    </select>
                                    <span className="text-xs bg-input text-muted-foreground px-1 rounded">Vol 2,431M</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-buy text-lg font-bold">67,231.00</span>
                                    <span className="text-xs text-buy">$67,231.00</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setInterval(tf)}
                                        className={`px-2 py-1 text-xs rounded hover:text-primary ${interval === tf ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 bg-card relative rounded-b overflow-hidden">
                            <Chart symbol={symbol} interval={interval} events={events} onPriceUpdate={handlePriceUpdate} />

                            {/* Price Alert Overlay */}
                            <div className="absolute top-4 right-4 bg-input p-2 rounded shadow-lg flex items-center gap-2 text-xs opacity-90 hover:opacity-100 transition-opacity z-10">
                                <span className="text-muted-foreground">Alert:</span>
                                <input
                                    type="number"
                                    placeholder="Target"
                                    className="w-20 bg-background text-foreground px-1 rounded outline-none border border-gray-700 focus:border-primary"
                                    value={alertPrice}
                                    onChange={(e) => setAlertPrice(e.target.value)}
                                />
                                <button
                                    onClick={() => setAlertEnabled(!alertEnabled)}
                                    className={`px-2 py-1 rounded font-bold ${alertEnabled ? 'bg-primary text-black' : 'bg-gray-600 text-gray-300'}`}
                                >
                                    {alertEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                        </div>

                        <div className="h-64 rounded overflow-hidden">
                            <PositionsTable events={events} />
                        </div>
                    </div>

                    {/* Right: Order Entry */}
                    <div className="w-[320px] rounded overflow-hidden">
                        <OrderForm symbol={symbol} />
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
}
