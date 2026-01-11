import { Request, Response, NextFunction } from "express";
import { TokenService } from "../../services/mongoose/services/Auth/token.service";
import { TokenPayload } from "../../services/mongoose/services/Auth/token.service";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenService = new TokenService();

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token manquant. Veuillez vous authentifier.",
      });
    }

    const parts = authHeader.split(" ");
    console.log(parts);

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Format de token invalide. Utilisez: Bearer <token>",
      });
    }

    const token = parts[1];

    const payload = tokenService.verifyToken(token);

    req.user = payload;

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: "Token invalide ou expiré",
      error: error.message,
    });
  }
}
