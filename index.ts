import express from 'express';
import {HealthCheckController} from './controllers';
import {openMongooseConnection, UserService} from "./services";
import {config} from "dotenv";
import {UserRole} from "./models";

config(); // LOAD ENV VAR

async function main() {
    const mongooseConnection = await openMongooseConnection();
    const userService = new UserService(mongooseConnection);

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
    const healthCheckController = new HealthCheckController();
    app.use('/health-check', healthCheckController.buildRouter());
    app.listen(process.env.PORT || 3000, () =>
        console.log(`Server listening on port ${process.env.PORT || 3000}!`)
    );
}

// Lance l'API
main().catch(console.error);