import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, ValidateNested, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  id!: number;

  @ApiProperty({
    example: 'jake@jake.jake',
    description: 'User email address',
  })
  email!: string;

  @ApiProperty({
    example: 'Jake',
    description: 'User display name',
  })
  username?: string;

  @ApiProperty({
    example: 'I like to skateboard',
    description: 'User bio',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    example: 'https://i.stack.imgur.com/xHWG8.jpg',
    description: 'User profile image URL',
    required: false,
  })
  image?: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT authentication token',
    required: false,
  })
  token?: string;
}

export class UserResponseDto {
  @ApiProperty({
    type: UserDto,
    description: 'User data',
  })
  user!: UserDto;
}

export class CreateUserDto {
  @ApiProperty({
    example: 'jake@jake.jake',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Jacob',
    description: 'User display name',
  })
  @IsString()
  @Matches(/^\S+$/, { message: 'auth.usernameWithoutSpaces' })
  username!: string;

  @ApiProperty({
    example: 'jakejake',
    description: 'User password',
  })
  @IsString()
  @MinLength(8, { message: 'auth.passwordTooShort' })
  password!: string;
}

export class CreateUserRequestDto {
  @ApiProperty({
    type: CreateUserDto,
    description: 'User data',
  })
  @ValidateNested()
  @Type(() => CreateUserDto)
  user!: CreateUserDto;
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'jake@jake.jake',
    description: 'User email address',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'Jacob',
    description: 'User display name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\S+$/, { message: 'auth.usernameWithoutSpaces' })
  username?: string;

  @ApiProperty({
    example: 'jakejake',
    description: 'User password',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'auth.passwordTooShort' })
  password?: string;

  @ApiProperty({
    example: 'I like to skateboard',
    description: 'User bio',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: 'https://i.stack.imgur.com/xHWG8.jpg',
    description: 'User profile image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateUserRequestDto {
  @ApiProperty({
    type: UpdateUserDto,
    description: 'User data to update',
  })
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user!: UpdateUserDto;
}
