import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { plainToClass } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';

// let config: ConfigService;

@Processor('mail.queue')
export class MailProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly mailerService: MailerService) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process('sendOTPConfirmationEmail')
  async sendOTPConfirmationEmail(job: Job<{ user: User; otp: number }>) {
    this.logger.log('zkfnjdvnjdvjdnjvj');
    try {
      this.logger.log(
        `sending confirmation email to user: ${job.data.user.email} from process: ${job.name}, otp: ${job.data.user.otp}`,
      );
      const result = await this.mailerService.sendMail({
        to: job.data.user.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Confirmation Code',
        template: './confirmation', // either change to ./transactional or rename transactional.html to confirmation.html
        context: {
          firstName: job.data.user.firstName,
          lastName: job.data.user.lastName,
          email: job.data.user.email,
          code: job.data.otp,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send reminder notification email to '${job.data.user.email}'`,
        error.stack,
      );
      this.logger.error(error);
      throw error;
    }
  }

  @Process('sendWelcomeEmail')
  async sendWelcomeEmail(job: Job<{ user: User }>) {
    try {
      this.logger.log(`sending welcome email to user: ${job.data.user.email}`);
      const result = await this.mailerService.sendMail({
        to: job.data.user.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to OkriCool',
        template: './welcome', // either change to ./transactional or rename transactional.html to confirmation.html
        context: {
          firstName: job.data.user.firstName,
          lastName: job.data.user.lastName,
          email: job.data.user.email,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send reminder notification email to '${job.data.user.email}'`,
        error.stack,
      );
      this.logger.error(error);
      throw error;
    }
  }

  @Process('sendRequestPasswordResetEmail')
  async sendRequestPasswordResetEmail(job: Job<{ user: User; otp: number }>) {
    try {
      this.logger.log(
        `sending request password reset to user: ${job.data.user.email}`,
      );
      const result = await this.mailerService.sendMail({
        to: job.data.user.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Reset Password',
        template: './request-reset-password', // either change to ./transactional or rename transactional.html to confirmation.html
        context: {
          firstName: job.data.user.firstName,
          lastName: job.data.user.lastName,
          email: job.data.user.email,
          code: job.data.otp,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send reminder notification email to '${job.data.user.email}'`,
        error.stack,
      );
      this.logger.error(error);
      throw error;
    }
  }
  @Process('sendPasswordResetSuccessfully')
  async sendPasswordResetSuccessfully(job: Job<{ user: User }>) {
    try {
      this.logger.log(`sending updated email to user: ${job.data.user.email}`);
      const result = await this.mailerService.sendMail({
        to: job.data.user.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Password Update Successful',
        template: './password-updated-success', // either change to ./transactional or rename transactional.html to confirmation.html
        context: {
          firstName: job.data.user.firstName,
          lastName: job.data.user.lastName,
          email: job.data.user.email,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send updated email email to '${job.data.user.email}'`,
        error.stack,
      );
      this.logger.error(error);
      throw error;
    }
  }
}
