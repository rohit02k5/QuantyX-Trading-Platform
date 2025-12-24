export interface Order {
    id: string;
    userId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_MARKET';
    quantity: number;
    price?: number;
    stopPrice?: number;
    status: 'PENDING' | 'NEW' | 'FILLED' | 'REJECTED' | 'CANCELED';
    createdAt: string;
    updatedAt: string;
}

export interface Position {
    symbol: string;
    size: number;
}

export interface OrderEvent {
    id: string;
    type?: string;
    orderId: string;
    userId: string;
    status: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    timestamp: string;
}

// Chart specific types
export interface Candle {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
}
