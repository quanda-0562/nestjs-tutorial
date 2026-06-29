import { ApiProperty } from '@nestjs/swagger';

/**
 * AuthorDto
 *
 * Contains author information for article responses
 */
class AuthorDto {
  @ApiProperty({
    example: 'jake',
    description: 'Author username',
  })
  username!: string;

  @ApiProperty({
    example: 'I work at statefarm',
    description: 'Author bio',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    example: 'https://i.stack.imgur.com/xHWG8.jpg',
    description: 'Author avatar image URL',
    required: false,
  })
  image?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the current user is following this author',
  })
  following!: boolean;
}

/**
 * ArticleDto
 *
 * Main DTO for article responses
 * Contains all article information in the format expected by API clients
 */
export class ArticleDto {
  @ApiProperty({
    example: 'how-to-train-your-dragon',
    description: 'Article slug',
  })
  slug!: string;

  @ApiProperty({
    example: 'How to train your dragon',
    description: 'Article title',
  })
  title!: string;

  @ApiProperty({
    example: 'Ever wonder how?',
    description: 'Article description',
  })
  description!: string;

  @ApiProperty({
    example: 'It takes a Jacobian',
    description: 'Article body content',
  })
  body!: string;

  @ApiProperty({
    example: ['dragons', 'training'],
    description: 'Article tags',
  })
  tagList!: string[];

  @ApiProperty({
    example: '2016-02-18T03:22:56.637Z',
    description: 'Article creation timestamp',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2016-02-18T03:48:35.824Z',
    description: 'Article last update timestamp',
  })
  updatedAt!: string;

  @ApiProperty({
    example: false,
    description: 'Whether the current user has favorited this article',
  })
  favorited!: boolean;

  @ApiProperty({
    example: 0,
    description: 'Number of users who have favorited this article',
  })
  favoritesCount!: number;

  @ApiProperty({
    description: 'Article author information',
    type: AuthorDto,
  })
  author!: AuthorDto;
}

/**
 * SingleArticleResponseDto
 *
 * Wrapper DTO for single article responses
 * Used when returning a single article from the API
 */
export class SingleArticleResponseDto {
  @ApiProperty({
    description: 'Article data',
    type: ArticleDto,
  })
  article!: ArticleDto;
}

/**
 * MultipleArticlesResponseDto
 *
 * Wrapper DTO for multiple articles responses
 * Used when returning a list of articles from the API
 */
export class MultipleArticlesResponseDto {
  @ApiProperty({
    type: [ArticleDto],
    description: 'List of articles',
  })
  articles!: ArticleDto[];

  @ApiProperty({
    example: 0,
    description: 'Total number of articles',
  })
  articlesCount!: number;
}
