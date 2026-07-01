import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SingleArticleResponseDto, MultipleArticlesResponseDto, ArticleDto } from './dto/article-response.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { User } from '../users/entities/user.entity';

/**
 * ArticlesController
 *
 * REST API controller for article management
 * Handles:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Favoriting and unfavoriting articles
 */
@ApiTags('Articles')
@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Create a new article
   * Requires authentication
   * @param createArticleDto - Article data from request body
   * @param req - Request object containing authenticated user
   * @returns Created article wrapped in SingleArticleResponseDto
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    type: SingleArticleResponseDto,
  })
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req: { user: User },
  ): Promise<SingleArticleResponseDto> {
    const article = await this.articlesService.create(createArticleDto, req.user);
    return { article };
  }

  /**
   * Get all articles with optional filtering and pagination
   * No authentication required
   * Returns most recent articles globally by default
   * @param query - Query parameters for filtering and pagination (tag, author, favorited, limit, offset)
   * @param req - Optional request object with user information
   * @returns List of articles with total count
   */
  @Get()
  @ApiOperation({
    summary: 'Get all articles',
    description: 'Returns most recent articles globally by default, can filter by tag, author or favorited user',
  })
  @ApiQuery({
    name: 'tag',
    type: String,
    required: false,
    description: 'Filter articles by tag',
    example: 'AngularJS',
  })
  @ApiQuery({
    name: 'author',
    type: String,
    required: false,
    description: 'Filter articles by author username',
    example: 'jake',
  })
  @ApiQuery({
    name: 'favorited',
    type: String,
    required: false,
    description: 'Filter articles favorited by a specific user (username)',
    example: 'jake',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Maximum number of articles to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Number of articles to skip (offset)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'List of articles',
    type: MultipleArticlesResponseDto,
  })
  async findAll(
    @Query() query: ListArticlesQueryDto,
    @Request() req?: { user?: User },
  ): Promise<MultipleArticlesResponseDto> {
    const { articles, total } = await this.articlesService.findAll(
      {
        tag: query.tag,
        author: query.author,
        favorited: query.favorited,
        limit: query.limit || 20,
        offset: query.offset || 0,
      },
      req?.user,
    );
    return {
      articles,
      articlesCount: total,
    };
  }

  /**
   * Get a single article by slug
   * No authentication required
   * @param slug - Article slug from URL parameter
   * @param req - Optional request object with user information
   * @returns Article details wrapped in SingleArticleResponseDto
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Get a specific article' })
  @ApiResponse({
    status: 200,
    description: 'Article details',
    type: SingleArticleResponseDto,
  })
  async findOne(
    @Param('slug') slug: string,
    @Request() req?: { user?: User },
  ): Promise<SingleArticleResponseDto> {
    const article = await this.articlesService.findOne(slug, req?.user);
    return { article };
  }

  /**
   * Update an article
   * Requires authentication and must be the article author
   * @param slug - Article slug from URL parameter
   * @param updateArticleDto - Updated article data
   * @param req - Request object containing authenticated user
   * @returns Updated article wrapped in SingleArticleResponseDto
   */
  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an article' })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    type: SingleArticleResponseDto,
  })
  async update(
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req: { user: User },
  ): Promise<SingleArticleResponseDto> {
    const article = await this.articlesService.update(slug, updateArticleDto, req.user);
    return { article };
  }

  /**
   * Delete an article
   * Requires authentication and must be the article author
   * @param slug - Article slug from URL parameter
   * @param req - Request object containing authenticated user
   * @returns No content (204 status)
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({
    status: 204,
    description: 'Article deleted successfully',
  })
  async remove(
    @Param('slug') slug: string,
    @Request() req: { user: User },
  ): Promise<void> {
    await this.articlesService.remove(slug, req.user);
  }

  /**
   * Add an article to user's favorites
   * Requires authentication
   * @param slug - Article slug from URL parameter
   * @param req - Request object containing authenticated user
   * @returns Article with favorited flag set to true
   */
  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Favorite an article' })
  @ApiResponse({
    status: 200,
    description: 'Article favorited successfully',
    type: SingleArticleResponseDto,
  })
  async favorite(
    @Param('slug') slug: string,
    @Request() req: { user: User },
  ): Promise<SingleArticleResponseDto> {
    const article = await this.articlesService.favorite(slug, req.user);
    return { article };
  }

  /**
   * Remove an article from user's favorites
   * Requires authentication
   * @param slug - Article slug from URL parameter
   * @param req - Request object containing authenticated user
   * @returns Article with favorited flag set to false
   */
  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unfavorite an article' })
  @ApiResponse({
    status: 200,
    description: 'Article unfavorited successfully',
    type: SingleArticleResponseDto,
  })
  async unfavorite(
    @Param('slug') slug: string,
    @Request() req: { user: User },
  ): Promise<SingleArticleResponseDto> {
    const article = await this.articlesService.unfavorite(slug, req.user);
    return { article };
  }
}
