const WebSocket = require('ws');

const urls = [
    'wss://stream.testnet.binance.vision/ws/btcusdt@kline_1m',
    'wss://stream.testnet.binance.vision:9443/ws/btcusdt@kline_1m',
    'wss://testnet.binance.vision/ws/btcusdt@kline_1m',
    'wss://stream.testnet.binance.vision/stream?streams=btcusdt@kline_1m'
];

async function testUrl(url) {
    return new Promise((resolve) => {
        console.log(`Testing ${url} ...`);
        const ws = new WebSocket(url);

        const timeout = setTimeout(() => {
            console.log(`❌ TIMEOUT: ${url}`);
            ws.terminate();
            resolve(false);
        }, 5000);

        ws.on('open', () => {
            console.log(`✅ SUCCESS: Connected to ${url}`);
            ws.close();
            clearTimeout(timeout);
            resolve(true);
        });

        ws.on('error', (err) => {
            console.log(`❌ ERROR: ${url} - ${err.message}`);
            // Don't reject, just resolve false
            ws.terminate(); // Ensure closed
            clearTimeout(timeout);
            resolve(false);
        });
    });
}

(async () => {
    for (const url of urls) {
        const success = await testUrl(url);
        if (success) {
            console.log(`\n🎉 FOUND WORKING URL: ${url}`);
            process.exit(0);
        }
    }
    console.log('\n❌ NO WORKING URLs FOUND');
    process.exit(1);
})();
