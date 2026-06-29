import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
  ArrayMaxSize,
  Matches,
} from 'class-validator';

/**
 * CreateArticleDto
 *
 * DTO for creating a new article
 * All fields are validated using class-validator decorators
 */
export class CreateArticleDto {
  @ApiProperty({
    example: 'How to train your dragon',
    description: 'Article title',
  })
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty or whitespace only' })
  @MaxLength(255)
  @Matches(/\S/, {
    message: 'Title must contain at least one non-whitespace character',
  })
  title!: string;

  @ApiProperty({
    example: 'Ever wonder how?',
    description: 'Article description',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  @ApiProperty({
    example: 'It takes a Jacobian',
    description: 'Article body content',
  })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiProperty({
    example: ['dragons', 'training'],
    description: 'Article tags (maximum 10 tags)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(10, { message: 'Maximum 10 tags are allowed' })
  @IsString({ each: true })
  @MinLength(1, {
    each: true,
    message: 'Each tag must have at least 1 character',
  })
  @MaxLength(50, {
    each: true,
    message: 'Each tag must not exceed 50 characters',
  })
  tagList?: string[];
}
