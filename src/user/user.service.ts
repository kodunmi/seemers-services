import { UserModule } from 'src/user/user.module';
import { AuthService } from '../auth/auth.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login.dto';
import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    const userEmailInDb = await this.userModel
      .find({
        email: email,
      })
      .exec();

    console.log(userEmailInDb);

    if (userEmailInDb.length > 0) {
      throw new HttpException(
        `User with the email already exists`,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const entity: User = await this.userModel.create({
        ...createUserDto,
        otp: Math.floor(100000 + Math.random() * 900000),
      });

      const a = await entity.save();

      return await this.userModel
        .findOne({
          _id: a._id,
        })
        .select({
          firstName: 1,
          lastName: 1,
          email: 1,
          id: 1,
          verified: 1,
          verifiedAt: 1,
        });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find({}).exec();
  }

  findOne(_id: ObjectId): Promise<User> {
    try {
      return this.userModel.findOne(_id).exec();
    } catch (error) {
      throw error;
    }
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userModel
      .findOne({
        email: email,
      })
      .exec();
  }

  async passwordCheck(user: User, password: string) {
    return new Promise((resolve, reject) => {
      user.checkPassword(password, (err, isMatch) => {
        if (err) {
          reject(new UnauthorizedException());
        }
        if (isMatch) {
          resolve(true);
        } else {
          reject(new BadRequestException(`Password don't match`));
        }
      });
    });
  }

  async findByLogin({ email, password }: LoginUserDto): Promise<User> {
    const user: User = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new HttpException(
        'No user with the email exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // compare passwords
    const areEqual = await this.passwordCheck(user, password);

    if (!areEqual) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    if (!user.verified) {
      throw new HttpException('User not verified', HttpStatus.UNAUTHORIZED);
    }

    this.userModel
      .findByIdAndUpdate(user._id, { lastLoginAt: new Date() })
      .exec();

    return user;
  }

  async findByEmail(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new HttpException(
        'No user with the email exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // compare passwords
    const areEqual = user.password == password;

    if (!areEqual) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // return this.usersRepository.update(id, updateUserDto);

    const entity = await this.userModel.findById({ _id: id });

    await entity.updateOne(Object.assign(entity, updateUserDto));

    return entity;
  }

  remove(id: ObjectId): Promise<User> {
    return this.userModel.findOneAndRemove({ _id: id }).exec();
  }

  async getOtp(id: string): Promise<number> {
    return this.userModel.findById(id).then((user) => {
      console.log(user);

      return user.otp;
    });
  }

  async getPasswordResetCode(id: string): Promise<number> {
    return this.userModel.findById(id).then((user) => {
      return user.forgetPasswordOtp;
    });
  }
}
