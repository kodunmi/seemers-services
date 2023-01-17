import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login.dto';
import { ResendOtpDto } from './dto/resendOtp.dto';
import { ResetPasswordDto } from './dto/rest-password.dto';
import * as bcrypt from 'bcrypt';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  async register(userDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.usersService.create(userDto);

      await this.mailService.sendOTPConfirmationEmail(
        user,
        await this.usersService.getOtp(user._id),
      );

      this.usersService.update(user.id, {
        expireAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
      });

      return user;
    } catch (err) {
      throw err;
    }
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: User; token: string }> {
    // find user in db
    const user = await this.usersService.findByLogin(loginUserDto);

    const token = this._createToken(user);

    return {
      user: user,
      token: token,
    };
  }

  async validateUserByToken(token: string): Promise<User> {
    const user: User = await this.jwtService.verify(token);
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email, password);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ email, password }: User): any {
    const accessToken = this.jwtService.sign(
      {
        email,
        password,
      },
      {
        secret: 'secret',
        privateKey: 'lekan',
        expiresIn: 2000,
      },
    );
    return accessToken;
  }

  async verifyEmail({ email, otp }: VerifyEmailDto): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.verified) {
      throw new HttpException(
        'User is already verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.otp != otp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    if (user.expireAt < new Date()) {
      throw new HttpException('OTP expired', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.usersService.update(user.id, {
        otp: null,
        expireAt: new Date(),
        verified: true,
        emailVerified: true,
      });

      await this.mailService.sendWelcomeEmail(user);

      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resendOtp({ email }: ResendOtpDto): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.verified) {
      throw new HttpException(
        'User is already verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      let updatedUser = await this.usersService.update(user.id, {
        expireAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
        otp: Math.floor(100000 + Math.random() * 900000),
      });
      // let resp = await this.smsService.sendSMS(user.phone, 'Your verification code is: ' + await this.usersService.getOtp(user.id));

      await this.mailService.sendOTPConfirmationEmail(
        updatedUser,
        await this.usersService.getOtp(user.id),
      );

      console.log(new Date(new Date().getTime() + 1000 * 60 * 60 * 24));
    } catch (err) {
      throw new HttpException('Error sending OTP', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async requestPasswordReset({ email }: ResendOtpDto): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);

    console.log(user);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      let updatedUser = await this.usersService.update(user.id, {
        forgetPasswordExpireAt: new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24,
        ),
        forgetPasswordOtp: Math.floor(100000 + Math.random() * 900000),
      });

      console.log(updatedUser);

      // let resp = await this.smsService.sendSMS(user.phone, 'Your password reset code is: ' + await this.usersService.getPasswordResetCode(user.id));

      await this.mailService.sendRequestPasswordResetEmail(
        updatedUser,
        await this.usersService.getPasswordResetCode(user.id),
      );
    } catch (err) {
      throw new HttpException(
        'Error sending OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return user;
  }

  async resetPassword({
    otp,
    password,
    confirmPassword,
    email,
  }: ResetPasswordDto): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.forgetPasswordOtp != otp) {
      throw new HttpException('Invalid OTP', HttpStatus.NOT_ACCEPTABLE);
    }

    if (user.forgetPasswordExpireAt < new Date()) {
      throw new HttpException('OTP expired', HttpStatus.BAD_REQUEST);
    }

    if (password != confirmPassword) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    try {
      this.usersService.update(user.id, {
        password: await bcrypt.hash(password, 10),
        forgetPasswordExpireAt: null,
        forgetPasswordOtp: null,
      });

      await this.mailService.sendPasswordResetSuccessfully(user);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    { oldPassword, newPassword }: UpdatePasswordDto,
    user: User,
  ): Promise<User> {
    const userObj = await this.usersService.findOneByEmail(user.email);

    console.log(userObj);

    if (!userObj) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      this.usersService.update(user.id, {
        password: await bcrypt.hash(newPassword, 10),
      });

      return userObj;
    } catch (error) {
      throw new error();
    }
  }
}
