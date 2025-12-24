export interface Order {
    id: string;
    userId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
    status: 'PENDING' | 'FILLED' | 'REJECTED';
    timestamp: Date;
}
