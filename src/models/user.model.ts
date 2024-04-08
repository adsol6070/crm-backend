import mongoose, { Document, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

interface UserSchema extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
}

const userSchema = new mongoose.Schema<UserSchema>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
});

const User: Model<UserSchema> = mongoose.model<UserSchema>('User', userSchema);

export default User;
