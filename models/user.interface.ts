export enum UserRole {
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
    CUSTOMER = 'CUSTOMER'
}

export interface User {
    _id?: string;
    lastname: string;
    firstname: string;
    birthdate?: Date;
    weight?: number;
    role: UserRole;
    login: string;
    password: string;
}

