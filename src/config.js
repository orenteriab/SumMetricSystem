import dotEnv from 'dotenv';

dotEnv.config();

export const PORT = process.env.PORT;
export const AUTH_KEY = process.env.AUTH_KEY;
export const EXPIRE_TIME = process.env.EXPIRE_TIME;
