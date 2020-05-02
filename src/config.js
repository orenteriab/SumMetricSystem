import dotEnv from 'dotenv';

dotEnv.config();

export const PORT = parseInt(process.env.port || process.env.PORT);
export const AUTH_KEY = process.env.AUTH_KEY;
export const EXPIRE_TIME = parseInt(process.env.EXPIRE_TIME);
export const NODE_ENV = process.env.NODE_ENV;
