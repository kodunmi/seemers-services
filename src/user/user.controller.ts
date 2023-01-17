// import { SmsService } from './../sms/sms.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SimpleUserUpdateDto } from './dto/simple-user-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
// import RoleGuard from 'src/shared/guards/role.guard';
// import Role from 'src/shared/enums/role.enum';
// import TypeGuard from 'src/shared/guards/type.guard';
// import { UserDecorator } from 'src/shared/decorators/user.decorator';
import { BaseResponse } from 'src/base-response.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('update-profile')
  @UseGuards(AuthGuard())
  update(@Body() updateUserDto: SimpleUserUpdateDto, @Req() req: any) {
    return this.userService.update(req.user.id, updateUserDto);
  }
}
