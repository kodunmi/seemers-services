import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { User } from 'src/user/entities/user.entity';

// let config: ConfigService;

@Injectable()
export class MailService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(@InjectQueue('mail.queue') private mailQueue: Queue) {}

  async sendOTPConfirmationEmail(user: User, otp: number) {
    try {
      this.logger.log(
        `Sending confirmation email to ${user.email}, from sendOTPConfirmationEmail function in mailService`,
      );
      await this.mailQueue.add('sendOTPConfirmationEmail', {
        user,
        otp,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Error queueing confirmation email to user ${user.email}`,
        error,
      );
      return false;
    }
  }

  async sendWelcomeEmail(user: User) {
    try {
      this.logger.log(`send welcome email to ${user.email}`);
      await this.mailQueue.add('sendWelcomeEmail', {
        user,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error queueing welcome email to user ${user.email}`);
      return false;
    }
  }

  async sendRequestPasswordResetEmail(user: User, otp: number) {
    try {
      this.logger.log(`Sending request password reset email to ${user.email}`);
      await this.mailQueue.add('sendRequestPasswordResetEmail', {
        user,
        otp,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Error queueing request password reset  email to user ${user.email}`,
      );
      this.logger.error(error);
      return false;
    }
  }

  async sendPasswordResetSuccessfully(user: User) {
    try {
      this.logger.log(
        `Sending password updated successfully email to ${user.email}`,
      );
      await this.mailQueue.add('sendPasswordResetSuccessfully', {
        user,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Error password updated successfully  email to user ${user.email}`,
      );
      return false;
    }
  }
}
