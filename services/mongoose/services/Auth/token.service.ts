import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../../../../models";

export interface TokenPayload {
    userId: string;
    login: string;
    role: string;
}

export class TokenService {
    private jwtSecret: string;
    private jwtExpiresIn: string | number;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'abrVcad4bra';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        
        if (!process.env.JWT_SECRET) {
            console.warn('JWT_SECRET non défini dans .env, utilisation d\'un secret par défaut');
        }
    }

    generateToken(user: User): string {
        if (!user._id) {
            throw new Error('Utilisateur sans ID');
        }

        const payload: TokenPayload = {
            userId: user._id.toString(),
            login: user.login,
            role: user.role
        };

        const options: SignOptions = {
            expiresIn: this.jwtExpiresIn as any
        };

        return jwt.sign(payload, this.jwtSecret, options) as string;
    }

    verifyToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token expiré');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Token invalide');
            }
            throw new Error('Erreur lors de la vérification du token');
        }
    }
}