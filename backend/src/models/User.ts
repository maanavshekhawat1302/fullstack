import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  phone: string;
  dateOfBirth: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otp?: string;
  otpExpires?: Date;
  googleId?: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function (this: any) { return !this.googleId; },
  },
  username: { type: String, required: true },
  phone: {
    type: String,
    required: function (this: any) { return !this.googleId; },
  },
  dateOfBirth: { type: Date, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  otp: { type: String },
  otpExpires: { type: Date },
  googleId: { type: String, unique: true, sparse: true },
});

export default mongoose.model<IUser>('User', UserSchema); 