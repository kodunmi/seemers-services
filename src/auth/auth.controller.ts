import { User } from '../user/entities/user.entity';
import { BaseResponse } from './../base-response.interface';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ResendOtpDto } from './dto/resendOtp.dto';
import { IsNotEmpty } from 'class-validator';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/rest-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { LoginUserDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<BaseResponse<User>> {
    try {
      const user: User = await this.authService.register(createUserDto);

      return {
        status: 'success',
        message: 'user registered',
        data: user,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  public async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<BaseResponse<{ user: User; token: string }>> {
    try {
      const data = await this.authService.login(loginUserDto);

      return {
        status: 'success',
        message: 'user logged in',
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-email')
  public async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<BaseResponse<{}>> {
    try {
      await this.authService.verifyEmail(verifyEmailDto);
      return {
        status: 'success',
        message: 'user verified',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('request-password-reset')
  public async requestPasswordReset(
    @Body() resetPasswordDto: ResendOtpDto,
  ): Promise<BaseResponse<{}>> {
    try {
      const user = await this.authService.requestPasswordReset(
        resetPasswordDto,
      );

      return {
        status: 'success',
        message: 'password reset request sent',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('reset-password')
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<BaseResponse<{}>> {
    try {
      const user = await this.authService.resetPassword(resetPasswordDto);

      return {
        status: 'success',
        message: 'password reset',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('resend-otp')
  public async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,
  ): Promise<BaseResponse<{}>> {
    try {
      const user: User = await this.authService.resendOtp(resendOtpDto);
      return {
        status: 'success',
        message: 'otp sent',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('update-password')
  @UseGuards(AuthGuard())
  public async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: any,
  ): Promise<BaseResponse<{}>> {
    try {
      const user: User = await this.authService.changePassword(
        updatePasswordDto,
        req.user,
      );
      return {
        status: 'success',
        message: 'password updated',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('whoami')
  @UseGuards(AuthGuard())
  public async testAuth(@Req() req: any): Promise<{ phone: string }> {
    return req.user;
  }
}
