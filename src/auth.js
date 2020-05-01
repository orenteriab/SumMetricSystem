import { AUTH_KEY } from './config';

/**
 * Simulates a simple authorization middleware.
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export default function authMiddleware (req, res, next) {
  if (req.headers.authorization !== AUTH_KEY) {
    return res.status(401).json({ error: 'You are not authorized to perform this action.' });
  }
  next();
};
