// services/mongoose/schema/user.schema.ts
import { Schema } from "mongoose";
import { User, UserRole } from "../../../models";
import * as bcrypt from 'bcrypt';

export function getUserSchema(): Schema<User> {
    const schema = new Schema<User>({      
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

    schema.pre('save', async function (next) {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  });

  return schema;
}