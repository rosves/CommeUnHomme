import { Router, Request, Response } from "express";
import { AuthService } from "../services/mongoose/services/Auth/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const { firstname, lastname, login, password, role, birthdate, weight } =
        req.body;

      // Validation basique
      if (!firstname || !lastname || !login || !password || !role) {
        return res.status(400).json({
          message: "Tous les champs obligatoires doivent être remplis",
        });
      }

      const authResponse = await this.authService.register({
        firstname,
        lastname,
        login,
        password,
        role,
        birthdate,
        weight,
      });

      res.status(201).json(authResponse);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de l'inscription",
        error: err.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;

      console.log(login, password);

      // Validation basique
      if (!login || !password) {
        return res.status(400).json({
          message: "Login et password sont obligatoires",
        });
      }

      const authResponse = await this.authService.login({ login, password });

      res.status(200).json(authResponse);
    } catch (err: any) {
      res.status(401).json({
        message: "Authentification échouée",
        error: err.message,
      });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.post("/register", this.register.bind(this));
    router.post("/login", this.login.bind(this));

    return router;
  }
}

// ajouter le health check
// rien en clair ni api dans jwt > le prof aime pas le JWT
// app.use('/auth', authController.buildRouter());
// salt = avant le mot de passe on ajoute une chaine de caractere pour complexifier le hash
// l'ordre des index est important sinon le trigger ne fonctionne pas correctement et la recherche doit etre faite dans l'ordre de déclaration
// Question > expliquer pourquoi "bind(this)"
// Schéma de session ???
