import { ApiProperty } from '@nestjs/swagger';

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
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT authentication token',
  })
  token!: string;
}

export class UserResponseDto {
  @ApiProperty({
    type: UserDto,
    description: 'User data',
  })
  user!: UserDto;
}
