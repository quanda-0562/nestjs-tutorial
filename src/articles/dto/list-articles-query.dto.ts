import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * ListArticlesQueryDto
 *
 * Query parameters for filtering and pagination of articles
 * Supports filtering by tag, author, favorited by user, and pagination
 */
export class ListArticlesQueryDto {
  /**
   * Filter articles by tag
   * @example "AngularJS"
   */
  @IsOptional()
  @IsString()
  tag?: string;

  /**
   * Filter articles by author username
   * @example "jake"
   */
  @IsOptional()
  @IsString()
  author?: string;

  /**
   * Filter articles favorited by a specific user (by username)
   * @example "jake"
   */
  @IsOptional()
  @IsString()
  favorited?: string;

  /**
   * Maximum number of articles to return
   * Default: 20
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 20;

  /**
   * Number of articles to skip/offset
   * Default: 0
   * @example 0
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number = 0;
}
