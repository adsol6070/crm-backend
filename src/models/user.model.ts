import bcrypt from "bcryptjs";
import logger from "../config/logger";
import { Knex } from "knex";

interface UserModel {
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
  isPasswordMatch(password: string, hashedPassword: string): Promise<boolean>;
  createUser(
    tenantID: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    role?: string,
  ): Promise<void>;
  getUserByEmail(email: string): Promise<any>;
}

const initializeUserModel = (dbConnection: Knex): UserModel => {
  // Define the user table schema if it doesn't exist
  dbConnection.schema
    .createTableIfNotExists("users", function (table: Knex.CreateTableBuilder) {
      table.increments("id").primary();
      table.uuid("tenantID").notNullable();
      table.string("firstname").notNullable();
      table.string("lastname").notNullable();
      table.string("email").notNullable().unique();
      table.string("phone").notNullable();
      table.string("profileImage").defaultTo("user");
      table.boolean("isEmailVerified").defaultTo(false);
      table.timestamps(true, true); // Adds created_at and updated_at columns
    })
    .then(() => {
      console.log("User table created successfully");
    })
    .catch((error: any) => {
      logger.error("Error creating user table:", error);
      throw error; // Terminate execution if table creation fails
    });

  // Define the UserModel functions
  const userModel: UserModel = {
    async isEmailTaken(
      email: string,
      excludeUserId?: string,
    ): Promise<boolean> {
      try {
        const user = await dbConnection("users")
          .where({ email })
          .andWhereNot("id", excludeUserId)
          .first();
        return !!user;
      } catch (error) {
        console.error("Error checking email existence:", error);
        throw error;
      }
    },

    async isPasswordMatch(
      password: string,
      hashedPassword: string,
    ): Promise<boolean> {
      return bcrypt.compare(password, hashedPassword);
    },

    async createUser(
      tenantID: string,
      name: string,
      email: string,
      password: string,
      role: string = "user",
    ): Promise<void> {
      try {
        const hashedPassword = await bcrypt.hash(password, 8);
        await dbConnection("users").insert({
          firstname: name.split(" ")[0], // Assuming name format is "Firstname Lastname"
          lastname: name.split(" ")[1], // Splitting name into firstname and lastname
          email,
          password: hashedPassword,
          phone: "", // You can add phone number handling if needed
          profileImage: "user",
          isEmailVerified: false,
          tenantID,
          role,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },

    async getUserByEmail(email: string): Promise<any> {
      try {
        return await dbConnection("users").where({ email }).first();
      } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
      }
    },
  };

  return userModel;
};

export default initializeUserModel;
