import express from 'express';
import {HealthCheckController, GymController, ExerciseController, UserController} from './controllers';
import {openMongooseConnection} from "./services";
import {GymService, ExerciseService, UserService} from "./services/mongoose/services";
import {config} from "dotenv";
import {UserRole} from "./models";

config(); // LOAD ENV VAR

async function main() {
    const mongooseConnection = await openMongooseConnection();
    const userService = new UserService(mongooseConnection);
    const gymService = new GymService(mongooseConnection);
    const exerciseService = new ExerciseService(mongooseConnection);

    const adminExists = await userService.findUser('admin');
    if (!adminExists) {
        await userService.createUser({
            role: UserRole.ADMIN,
            login: 'admin',
            password: process.env.ROOT_USER_PASSWORD as string,
            lastname: 'Admin',
            firstname: 'Admin'
        });
        console.log('Root admin created');
    }

    const app = express();
    app.use(express.json()); // pour la compréhension de postman

    const healthCheckController = new HealthCheckController();
    const gymController = new GymController(gymService); 
    const exerciseController = new ExerciseController(exerciseService);
    const userController = new UserController(userService);

    app.use('/health-check', healthCheckController.buildRouter());
    app.use('/gym', gymController.buildRouter()); 
    app.use('/exercise', exerciseController.buildRouter());
    app.use('/user', userController.buildRouter());

    app.listen(process.env.PORT || 3000, () =>
        console.log(`Server listening on port ${process.env.PORT || 3000}!`)
    );
}

// Lance l'API
main().catch(console.error);