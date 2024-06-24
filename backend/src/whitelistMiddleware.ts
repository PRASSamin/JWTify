import { Request, Response, NextFunction } from 'express';

const whitelist: string[] = [
  'http://localhost:5173',
  'https://jwtify.onrender.com'
];

export const urlWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const referer = req.get('Referer') || req.get('Origin');

  if (referer) {
    const url = new URL(referer);
    if (whitelist.includes(`${url.protocol}//${url.host}`)) {
    console.log(`Authorized: ${url.protocol}//${url.host}`)  
    next();
    return;
}
console.log(`Unauthorized: ${url.protocol}//${url.host}`)  
}

  res.status(403).send('Access forbidden: URL is not whitelisted');
};
