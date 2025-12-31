// services/mongoose/schema/user.schema.ts
import { Schema } from "mongoose";
import { User, UserRole } from "../../../models";

export function getUserSchema(): Schema<User> {
  return new Schema<User>({
      lastname: {
        type: String,
        required: true,
      },
      firstname: { 
        type: String, 
        required: true 
      },
      login: { 
        type: String, 
        required: true, 
        unique: true 
      },
      password: { 
        type: String, 
        required: true 
      },
      role: { 
        type: String, 
        required: true, 
        enum: Object.values(UserRole) 
      },
      weight: { 
        type: Number 
      },
      birthdate: { 
        type: Date 
      },
    }, { 
        collection: "users", 
        versionKey: false 
    });
}