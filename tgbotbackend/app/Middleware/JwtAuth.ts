import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const SECRET_KEY: Secret = '6591061458:AAGt37yxXhtNX7BYITlayEfhkj0-FUIyr_0';

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const JwtAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    res.status(401);
    return res.json({
      status: 0,
      message: 'Unauthorized user!',
    });
  }
};