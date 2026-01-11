import { Router, Request, Response } from "express";
import { UserService } from "../services/mongoose/services/user.service";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { UserRole } from "../models";
import * as bcrypt from 'bcrypt';

export class UserController {
    constructor(private userService: UserService) {}

    async create(req: Request, res: Response) {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({
                _id: user._id,
                login: user.login,
                role: user.role
            });
        } catch (err) {
            res.status(400).json({ message: "Erreur création", error: err });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const users = await this.userService.findAll();
            res.json(users);
        } catch (err) {
            res.status(500).json({ message: "Erreur lecture", error: err });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const user = await this.userService.userModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.json({
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                login: user.login,
                role: user.role,
                weight: user.weight,
                birthdate: user.birthdate
            });
        } catch (err) {
            res.status(400).json({ message: "ID invalide", error: err });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const user = await this.userService.userModel.findByIdAndUpdate(
                req.params.id, 
                req.body, 
                { new: true }
            );
            if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
            res.json(user);
        } catch (err) {
            res.status(400).json({ message: "Erreur modification", error: err });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result = await this.userService.userModel.findByIdAndDelete(req.params.id);
            if (!result) return res.status(404).json({ message: "Utilisateur non trouvé" });
            res.json({ success: true });
        } catch (err) {
            res.status(400).json({ message: "Erreur suppression", error: err });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { login, password } = req.body;
            const user = await this.userService.findUser(login);

            if (user && await bcrypt.compare(password, user.password)) {
                res.json({ message: "Connecté", role: user.role, id: user._id });
            } else {
                res.status(401).json({ message: "Identifiants incorrects" });
            }
        } catch (err) {
            res.status(500).json({ message: "Erreur login" });
        }
    }

    buildRouter(): Router {
        const router = Router();
        
        router.post('/register', this.create.bind(this));      
        router.post('/login', this.login.bind(this));
        
        router.get('/all', authMiddleware, requireRole(UserRole.ADMIN), this.getAll.bind(this));  
        router.get('/:id', authMiddleware, this.getById.bind(this));  
        router.put('/:id', authMiddleware, this.update.bind(this));    
        router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), this.delete.bind(this));
        
        return router;
    }
}