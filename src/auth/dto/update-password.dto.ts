import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
export class UpdatePasswordDto {
    @IsNotEmpty()
    @ApiProperty()
    oldPassword: string;

    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty()
    newPassword: string;
}