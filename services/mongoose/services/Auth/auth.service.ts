import { Mongoose } from "mongoose";
import { User, UserRole } from "../../../../models";
import { UserService } from "../user.service";
import { TokenService } from "./token.service";
import { comparePassword } from "../../../../utils";

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

    async register(userData: User): Promise<AuthResponse> {
        const existingUser = await this.userService.findUser(userData.login);
        if (existingUser) {
            throw new Error('Cet identifiant est déjà utilisé');
        }

        const user = await this.userService.createUser(userData);

        const token = this.tokenService.generateToken(user);

        return {
            user: {
                _id: user._id!.toString(),
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

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Identifiants invalides');
        }

        const token = this.tokenService.generateToken(user);

        if (!user._id) {
            throw new Error('User ID is missing');
        }

        return {
            user: {
                _id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                login: user.login,
                role: user.role
            },
            token
        };
    }
}