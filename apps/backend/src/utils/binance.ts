import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://testnet.binance.vision/api/v3';


// In-memory cache implementation
const cache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_TTL = 2000; // 2 seconds

export const getAccountInfo = async (apiKey: string, apiSecret: string) => {
    try {
        const cacheKey = `account_${apiKey}`;
        const now = Date.now();

        if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_TTL)) {
            return cache[cacheKey].data;
        }

        const timestamp = Date.now();
        const query = `timestamp=${timestamp}`;

        // Decrypt keys (Base64 decode as per auth.ts mock encryption)
        const secret = Buffer.from(apiSecret, 'base64').toString('utf-8');
        const key = Buffer.from(apiKey, 'base64').toString('utf-8');

        const signature = crypto.createHmac('sha256', secret).update(query).digest('hex');
        const url = `${BASE_URL}/account?${query}&signature=${signature}`;

        const response = await axios.get(url, {
            headers: {
                'X-MBX-APIKEY': key
            }
        });

        // Update cache
        cache[cacheKey] = {
            data: response.data,
            timestamp: now
        };

        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('Binance Account Info Error:', error.response.data);
            throw new Error(JSON.stringify(error.response.data));
        }
        throw error;
    }
};
