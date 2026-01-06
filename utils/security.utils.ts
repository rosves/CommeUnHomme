import {createHash} from "crypto";
import * as bcrypt from 'bcrypt';

// Pour hasher des données génériques (tokens, checksums, etc.)
export function sha256(str: string): string {
    return createHash('sha256').update(str).digest('hex');
}

// Pour les mots de passe
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}