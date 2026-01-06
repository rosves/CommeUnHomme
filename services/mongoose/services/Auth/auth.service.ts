import { Mongoose } from "mongoose";
import { UserRole } from "../../../../models";
import { UserService, CreateUser } from "../user.service";
import { TokenService } from "./token.service";
import { sha256 } from "../../../../utils";

export interface LoginCredentials {
    login: string;
    password: string;
}

export interface AuthResponse {
    user: {
        _id: string;
        firstname: string;
        lastname: string;
        login: string;
        role: UserRole;
    };
    token: string;
}

export class AuthService {
    private userService: UserService;
    private tokenService: TokenService;

    constructor(userService: UserService) {
        this.userService = userService;
        this.tokenService = new TokenService();
    }

    async register(userData: CreateUser): Promise<AuthResponse> {
        const existingUser = await this.userService.findUser(userData.login);
        if (existingUser) {
            throw new Error('Cet identifiant est déjà utilisé');
        }

        const user = await this.userService.createUser(userData);

        const token = this.tokenService.generateToken(user);

        return {
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                login: user.login,
                role: user.role
            },
            token
        };
    }

  
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { login, password } = credentials;

        const user = await this.userService.findUser(login);
        if (!user) {
            throw new Error('Identifiants invalides');
        }

        const hashedPassword = sha256(password);
        if (user.password !== hashedPassword) {
            throw new Error('Identifiants invalides');
        }

        const token = this.tokenService.generateToken(user);

        return {
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                login: user.login,
                role: user.role
            },
            token
        };
    }
}
