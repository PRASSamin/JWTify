import { Request, Response, NextFunction } from 'express';

const whitelist: string[] = [
  'https://jwtify.onrender.com',
  "http://localhost:5173"
];

export const urlWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/') {
    return next();
  }

  const referer = req.get('Referer') || req.get('Origin');

  if (referer) {
    const url = new URL(referer);
    if (whitelist.includes(`${url.protocol}//${url.host}`)) {
      console.log(`Authorized: ${url.protocol}//${url.host}`);
      return next();
    }
    console.log(`Unauthorized: ${url.protocol}//${url.host}`);
  }

  res.status(403).json({message: 'Access forbidden: URL is not whitelisted', status: 403});
};