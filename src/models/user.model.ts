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
  const createUsersTable = async (): Promise<void> => {
    try {
      const tableExists = await dbConnection.schema.hasTable("users");
    if (!tableExists) {
      await dbConnection.schema.createTable(
        "users",
        function (table: Knex.CreateTableBuilder) {
          table.increments("id").primary();
          table.uuid("tenantID").notNullable();
          table.string("firstname").notNullable();
          table.string("lastname").notNullable();
          table.string("email").notNullable().unique();
          table.string("phone").notNullable();
          table.string("profileImage").notNullable();
          table.boolean("isEmailVerified").defaultTo(false);
          table.string("role").notNullable();
          table.timestamps(true, true);
        },
      );
      logger.info("Tenant table created successfully");
    }
    } catch (error) {
      logger.error("Error creating user table:", error);
      throw error;
    }
  };

  createUsersTable();

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
      firstname: string,
      lastname: string,
      email: string,
      password: string,
      role: string = "user",
    ): Promise<void> {
      try {
        const hashedPassword = await bcrypt.hash(password, 8);
        await dbConnection("users").insert({
          firstname,
          lastname,
          email,
          password: hashedPassword,
          phone: "",
          profileImage: "user",
          isEmailVerified: false,
          tenantID,
          role,
        });
      } catch (error) {
        logger.error("Error creating user:", error);
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
