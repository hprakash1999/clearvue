import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';

// User interface definition
export interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  password: string;
  avatar: string; // Cloudinary URL
  role: string;
  favorites: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// User schema definition
const userSchema: Schema<User> = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      pinCode: {
        type: String,
        required: true,
        trim: true,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    avatar: {
      type: String, // Cloudinary URL
      default: '/assets/default-avatar.png',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre<User>('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', userSchema);

export { UserModel };
