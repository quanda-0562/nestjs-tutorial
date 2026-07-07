import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CommentAuthorDto {
  @ApiProperty({
    example: 'jake',
    description: 'Comment author username',
  })
  username!: string;

  @ApiProperty({
    example: 'I work at statefarm',
    description: 'Comment author bio',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    example: 'https://i.stack.imgur.com/xHWG8.jpg',
    description: 'Comment author avatar image URL',
    required: false,
  })
  image?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the current user is following this author',
  })
  following!: boolean;
}

class CommentBodyDto {
  @ApiProperty({
    example: 'His name was my name too.',
    description: 'Comment body',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body!: string;
}

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment payload',
    type: CommentBodyDto,
  })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => CommentBodyDto)
  comment!: CommentBodyDto;
}

export class CommentDto {
  @ApiProperty({
    example: 1,
    description: 'Comment id',
  })
  id!: number;

  @ApiProperty({
    example: '2016-02-18T03:22:56.637Z',
    description: 'Comment creation timestamp',
  })
  createdAt!: string;

  @ApiProperty({
    example: 'It takes a Jacobian',
    description: 'Comment body',
  })
  body!: string;

  @ApiProperty({
    description: 'Comment author information',
    type: CommentAuthorDto,
  })
  author!: CommentAuthorDto;
}

export class SingleCommentResponseDto {
  @ApiProperty({
    description: 'Comment data',
    type: CommentDto,
  })
  comment!: CommentDto;
}

export class MultipleCommentsResponseDto {
  @ApiProperty({
    description: 'List of comments',
    type: [CommentDto],
  })
  comments!: CommentDto[];
}
