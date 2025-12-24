const Redis = require('ioredis');

// Connect to the same Redis as the app
const redis = new Redis('redis://localhost:6379');

redis.monitor((err, monitor) => {
    if (err) {
        console.error('Failed to enter monitor mode:', err);
        process.exit(1);
    }

    console.log('✅ Connected to Redis! Listening for commands...');
    console.log('Perform an action in the app (e.g. place an order) to see it here.\n');

    monitor.on('monitor', (time, args, source, database) => {
        // Filter out some noise if needed, or just log everything
        console.log(`[${time}] ${args.join(' ')}`);
    });
});
