import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
  ArrayMaxSize,
} from 'class-validator';

/**
 * UpdateArticleDto
 *
 * DTO for updating an article
 * All fields are optional
 *
 * Note: Title cannot be updated. The article slug is immutable after creation
 * to preserve existing links and bookmarks to the article.
 */
export class UpdateArticleDto {
  @ApiProperty({
    example: 'Ever wonder how?',
    description: 'Article description',
    required: false,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'It takes a Jacobian',
    description: 'Article body content',
    required: false,
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  body?: string;

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
