import knex from 'knex';
import bcrypt from 'bcryptjs';

// Initialize Knex.js with your PostgreSQL connection
const db = knex({
  client: 'pg',
  connection: {
    host: 'your_host',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name',
  },
});

// Define the user table schema
db.schema.createTableIfNotExists('users', function (table) {
  table.increments('id').primary();
  table.string('name').notNullable();
  table.string('email').notNullable().unique();
  table.string('password').notNullable();
  table.string('role').defaultTo('user');
  table.boolean('isEmailVerified').defaultTo(false);
  table.timestamps(true, true); // Adds created_at and updated_at columns
}).then(() => {
  console.log('User table created successfully');
}).catch((error) => {
  console.error('Error creating user table:', error);
  throw error; // Terminate execution if table creation fails
});

// Define the user model functions
const UserModel = {
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const user = await db('users').where({ email }).andWhereNot('id', excludeUserId).first();
      return !!user;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  },

  async isPasswordMatch(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  },

  async createUser(name: string, email: string, password: string, role: string = 'user'): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(password, 8);
      await db('users').insert({ name, email, password: hashedPassword, role });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<any> {
    try {
      return await db('users').where({ email }).first();
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }
};

export default UserModel;
