import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @MinLength(8)
  password!: string;
}

export class LoginRequestDto {
  @ApiProperty({
    type: UserLoginDto,
    description: 'User credentials',
  })
  user!: UserLoginDto;
}
