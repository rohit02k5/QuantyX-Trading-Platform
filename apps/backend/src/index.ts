import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { authRouter } from './routes/auth';
import { orderRouter } from './routes/order';
import { accountRouter } from './routes/account';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


const app = express();

app.use(cors());
app.use(express.json());
app.use(limiter);

app.use('/auth', authRouter);
app.use('/api/trading', orderRouter);
app.use('/api/account', accountRouter);


app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(CONFIG.PORT, () => {
    console.log(`API Gateway running on port ${CONFIG.PORT}`);
});
