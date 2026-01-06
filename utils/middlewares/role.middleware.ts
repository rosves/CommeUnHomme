import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../models';

/**
 * Middleware qui vérifie le rôle de l'utilisateur
 * À utiliser APRÈS authMiddleware
 * 
 * Exemple: requireRole('ADMIN')
 *          requireRole('ADMIN', 'OWNER')
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Authentification requise' 
            });
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            return res.status(403).json({ 
                message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}` 
            });
        }

        next();
    };
}