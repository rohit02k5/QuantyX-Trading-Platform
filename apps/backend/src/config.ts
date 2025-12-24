import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    PORT: process.env.PORT || 3001,
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};
