import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth; 