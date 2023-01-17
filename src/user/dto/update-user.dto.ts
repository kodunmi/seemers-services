import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  otp?: number;
  expireAt?: Date;
  verifiedAt?: Date;
  verified?: boolean;
  forgetPasswordOtp?: number;
  forgetPasswordExpireAt?: Date;
  emailVerified?: boolean;
}
