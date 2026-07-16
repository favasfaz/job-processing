import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.authService.login(req.body.username, req.body.password);
      if (!token) {
        res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Invalid credentials' });
        return;
      }
      res.json({ token });
    } catch (error) {
      next(error);
    }
  };
}
