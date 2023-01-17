import { UpdateUserDto } from './update-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class SimpleUserUpdateDto extends PartialType(UpdateUserDto) {
    fullName?: string;
    email?: string;
    chapterId?: string;
    tenId?: string;
}