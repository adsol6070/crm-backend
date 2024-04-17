import { Knex } from "knex";
import bcrypt from "bcryptjs";

const isEmailTaken = async (
  connection: Knex,
  email: string,
): Promise<boolean> => {
  const user = await connection("users").where({ email }).first();
  return !!user;
};

const isPasswordMatch = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export default { isEmailTaken, isPasswordMatch };
