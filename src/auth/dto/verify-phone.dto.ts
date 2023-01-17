import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class VerifyPhoneDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
     phone: string;

     @IsNumber()
     @IsNotEmpty()
     @ApiProperty()
     otp: number;
}