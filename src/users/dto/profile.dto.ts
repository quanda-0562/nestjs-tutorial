import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({
    example: 'jake',
    description: 'User username',
  })
  username!: string;

  @ApiProperty({
    example: 'I work at statefarm',
    description: 'User bio',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    example: 'https://api.realworld.io/images/smiley-cyrus.jpg',
    description: 'User profile image URL',
    required: false,
  })
  image?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the current user is following this profile',
  })
  following!: boolean;
}

export class ProfileResponseDto {
  @ApiProperty()
  profile!: ProfileDto;
}
