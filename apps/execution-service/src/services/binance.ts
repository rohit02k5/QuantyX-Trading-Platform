import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://testnet.binance.vision/api/v3';

export const placeOrder = async (apiKey: string, apiSecret: string, symbol: string, side: string, type: string, quantity: number, price?: number) => {
    try {
        const timestamp = Date.now() - 2000; // Subtract 2s to account for clock skew
        const query = `symbol=${symbol}&side=${side}&type=${type}&quantity=${quantity}${price ? `&price=${price}&timeInForce=GTC` : ''}&timestamp=${timestamp}`;

        // Decrypt keys here if actual encryption was used, but we stored encrypted string so we just pass it? 
        // Wait, in auth.ts we did base64. We need to decrypt (decode base64) before using.
        const secret = Buffer.from(apiSecret, 'base64').toString('utf-8');
        const key = Buffer.from(apiKey, 'base64').toString('utf-8');

        const signature = crypto.createHmac('sha256', secret).update(query).digest('hex');
        const url = `${BASE_URL}/order?${query}&signature=${signature}`;

        const response = await axios.post(url, null, {
            headers: {
                'X-MBX-APIKEY': key
            }
        });

        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('Binance Error:', error.response.data);
            throw new Error(JSON.stringify(error.response.data));
        }
        throw error;
    }
};
