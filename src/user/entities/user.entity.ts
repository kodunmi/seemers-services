// import bcrypt from 'bcrypt';
import * as bcrypt from 'bcrypt';
import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CatDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    unique: true,
  })
  email: string;

  @Prop({
    select: true,
  })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ nullable: true, select: true })
  otp: number;

  @Prop({ nullable: true, select: true })
  forgetPasswordOtp: number;

  @Prop({ nullable: true })
  forgetPasswordExpireAt: Date;

  @Prop({ nullable: true })
  expireAt: Date;

  @Prop({ nullable: true })
  verifiedAt: Date;

  @Prop({ nullable: false, default: false })
  verified: boolean;

  @Prop({ nullable: true })
  lastLoginAt: Date;

  @Prop({ nullable: true })
  lastLoginIp: string;

  @Prop({
    nullable: true,
  })
  photo: string;

  @Prop({
    nullable: true,
  })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  let user = this as any;
  // Make sure not to rehash the password if it is already hashed
  if (!user.isModified('password')) return next();
  // Generate a salt and use it to hash the user's password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// UserSchema.methods.checkPassword = function (attempt, password) {
//   let user = this;
//   return bcrypt.compare(attempt, password);
// };

UserSchema.methods.checkPassword = function (attempt, callback) {
  let user = this;
  bcrypt.compare(attempt, user.password, (err, isMatch) => {
    console.log(attempt, user.password);

    if (err) return callback(err);
    callback(null, isMatch);
  });
};

export interface User extends mongoose.Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  emailVerified: boolean;
  otp: number;
  forgetPasswordOtp: number;
  forgetPasswordExpireAt: Date;
  expireAt: Date;
  verifiedAt: Date;
  lastLoginAt: Date;
  lastLoginIp: string;
  photo: string;
  phone: string;
  verified: boolean;
  checkPassword(candidatePassword: string, callback: any): Promise<boolean>;
}
