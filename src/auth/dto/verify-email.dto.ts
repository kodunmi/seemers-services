import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class VerifyEmailDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    otp: number;
}