import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '../lib/api';
import { Order, Position, OrderEvent } from '../types';

// Use dynamic import for the wrapper to avoid SSR issues with react-window
const List = dynamic(() => import('./VirtualizedList'), { ssr: false });

export default function PositionsTable({ events }: { events: OrderEvent[] }) {
    const [data, setData] = useState<(Order | Position)[]>([]);
    const [activeTab, setActiveTab] = useState('POSITIONS');

    const fetchData = () => {
        if (activeTab === 'POSITIONS') {
            api.get('/trading/positions').then(res => setData(res.data as Position[]));
        } else {
            api.get('/trading/orders').then(res => {
                const allOrders = res.data as Order[];
                if (activeTab === 'ORDERS') {
                    setData(allOrders.filter((o) => o.status === 'PENDING' || o.status === 'NEW'));
                } else {
                    setData(allOrders.filter((o) => o.status !== 'PENDING' && o.status !== 'NEW'));
                }
            });
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        if (events.length > 0) {
            fetchData();
        }
    }, [events]);

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const item = data[index];
        const isPos = activeTab === 'POSITIONS';
        const pos = item as Position;
        const order = item as Order;

        return (
            <div style={style} className="flex border-b border-input hover:bg-input/50 items-center text-xs">
                {isPos ? (
                    <>
                        <div className="w-1/6 font-bold px-2">{pos.symbol}</div>
                        <div className="w-1/6 font-bold" style={{ color: pos.size > 0 ? 'var(--buy)' : 'var(--sell)' }}>{pos.size}</div>
                        <div className="w-1/6">--</div>
                        <div className="w-1/6">--</div>
                        <div className="w-1/6 text-buy">--</div>
                        <div className="w-1/6"></div>
                    </>
                ) : (
                    <>
                        <div className="w-1/6 text-muted-foreground px-2">{new Date(order.createdAt).toLocaleTimeString()}</div>
                        <div className="w-1/6 font-bold flex items-center gap-1">{order.symbol}</div>
                        <div className="w-1/6" style={{ color: order.side === 'BUY' ? 'var(--buy)' : 'var(--sell)' }}>{order.side}</div>
                        <div className="w-1/6">{order.price || 'Market'}</div>
                        <div className="w-1/6">{order.quantity}</div>
                        <div className="w-1/6 text-right flex justify-end items-center gap-2 pr-2">
                            <span>{order.status}</span>
                            {(order.status === 'PENDING' || order.status === 'NEW') && (
                                <button
                                    onClick={() => {
                                        if (confirm('Cancel Order?')) {
                                            api.delete(`/trading/orders/${order.id}`).then(() => alert('Cancel Submitted'));
                                        }
                                    }}
                                    className="bg-red-500/20 text-red-500 hover:bg-red-500/40 px-2 py-1 rounded text-[10px]"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="bg-card w-full h-full flex flex-col border-t border-border">
            <div className="flex px-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                {['POSITIONS', 'ORDERS', 'HISTORY'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors duration-200 ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted hover:text-foreground'
                            }`}
                    >
                        {tab === 'POSITIONS' ? 'Positions' : tab === 'ORDERS' ? 'Open Orders' : 'Order History'}
                    </button>
                ))}
                <div className="flex-1" />
                <button onClick={fetchData} className="text-muted hover:text-primary px-4 text-xs font-medium transition-colors">
                    Refresh
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex bg-input/30 text-muted p-2 text-[10px] font-bold uppercase tracking-wider border-b border-border">
                    <div className="w-1/6 px-4">{activeTab === 'POSITIONS' ? 'Symbol' : 'Time'}</div>
                    <div className="w-1/6">{activeTab === 'POSITIONS' ? 'Size' : 'Symbol'}</div>
                    <div className="w-1/6">{activeTab === 'POSITIONS' ? 'Entry Price' : 'Side'}</div>
                    <div className="w-1/6 text-right">{activeTab === 'POSITIONS' ? 'Mark Price' : 'Price'}</div>
                    <div className="w-1/6 text-right">{activeTab === 'POSITIONS' ? 'PnL' : 'Qty'}</div>
                    <div className="w-1/6 text-right pr-4">{activeTab === 'POSITIONS' ? '' : 'Status'}</div>
                </div>

                <div className="flex-1 relative">
                    {data.length > 0 ? (
                        <List
                            height={250}
                            itemCount={data.length}
                            itemSize={40}
                            width={'100%'}
                        >
                            {Row}
                        </List>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted italic">
                            <span className="text-4xl opacity-10 mb-2">📭</span>
                            <span className="text-xs">No {activeTab.toLowerCase().replace('_', ' ')} found</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
