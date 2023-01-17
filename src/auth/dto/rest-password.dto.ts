import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
export class ResetPasswordDto {
    @IsNotEmpty()
    @ApiProperty()
    email: string;

    @IsNotEmpty()
    @ApiProperty()
    password: string;

    @IsNotEmpty()
    @ApiProperty()
    confirmPassword: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    otp: number
}