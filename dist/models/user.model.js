"use strict";
// import bcrypt from "bcryptjs";
// interface UserModel {
//   isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
//   isPasswordMatch(password: string, hashedPassword: string): Promise<boolean>;
//   createUser(
//     name: string,
//     email: string,
//     password: string,
//     role?: string,
//   ): Promise<void>;
//   getUserByEmail(email: string): Promise<any>;
// }
// const initializeUserModel = (dbConnection: any): UserModel => {
//   // Define the user table schema if it doesn't exist
//   dbConnection.schema
//     .createTableIfNotExists("users", function (table) {
//       table.increments("id").primary();
//       table.string("name").notNullable();
//       table.string("email").notNullable().unique();
//       table.string("password").notNullable();
//       table.string("role").defaultTo("user");
//       table.boolean("isEmailVerified").defaultTo(false);
//       table.timestamps(true, true); // Adds created_at and updated_at columns
//     })
//     .then(() => {
//       console.log("User table created successfully");
//     })
//     .catch((error) => {
//       console.error("Error creating user table:", error);
//       throw error; // Terminate execution if table creation fails
//     });
//   // Define the UserModel functions
//   const userModel: UserModel = {
//     async isEmailTaken(
//       email: string,
//       excludeUserId?: string,
//     ): Promise<boolean> {
//       try {
//         const user = await dbConnection("users")
//           .where({ email })
//           .andWhereNot("id", excludeUserId)
//           .first();
//         return !!user;
//       } catch (error) {
//         console.error("Error checking email existence:", error);
//         throw error;
//       }
//     },
//     async isPasswordMatch(
//       password: string,
//       hashedPassword: string,
//     ): Promise<boolean> {
//       return bcrypt.compare(password, hashedPassword);
//     },
//     async createUser(
//       name: string,
//       email: string,
//       password: string,
//       role: string = "user",
//     ): Promise<void> {
//       try {
//         const hashedPassword = await bcrypt.hash(password, 8);
//         await dbConnection("users").insert({
//           name,
//           email,
//           password: hashedPassword,
//           role,
//         });
//       } catch (error) {
//         console.error("Error creating user:", error);
//         throw error;
//       }
//     },
//     async getUserByEmail(email: string): Promise<any> {
//       try {
//         return await dbConnection("users").where({ email }).first();
//       } catch (error) {
//         console.error("Error fetching user by email:", error);
//         throw error;
//       }
//     },
//   };
//   return userModel;
// };
// export default initializeUserModel;
