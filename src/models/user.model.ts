import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

interface UserSchema extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
}

const userSchema = new mongoose.Schema<UserSchema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 16,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number",
          );
        }
      },
      private: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User: Model<UserSchema> = mongoose.model<UserSchema>("User", userSchema);

export default User;
