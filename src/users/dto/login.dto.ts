import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserLoginDto {
  @ApiProperty({
    example: 'jake@jake.jake',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'jakejake',
    description: 'User password',
  })
  @IsString()
  @MinLength(8, { message: 'auth.passwordTooShort' })
  password!: string;
}

export class LoginRequestDto {
  @ApiProperty({
    type: UserLoginDto,
    description: 'User credentials',
  })
  @ValidateNested()
  @Type(() => UserLoginDto)
  user!: UserLoginDto;
}
