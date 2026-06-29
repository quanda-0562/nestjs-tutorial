import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { User } from '../users/entities/user.entity';
import { ArticleDto } from './dto/article-response.dto';
import { slugify } from '../common/utils/slugify';

/**
 * ArticlesService
 *
 * Service responsible for all article-related business logic including:
 * - Creating and managing articles
 * - Querying articles by various criteria
 * - Handling article favoriting/unfavoriting
 * - Authorization checks for article modifications
 */
@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new article
   * @param createArticleDto - Article data (title, description, body, tagList)
   * @param author - The user creating the article
   * @returns The created article as ArticleDto
   */
  async create(
    createArticleDto: CreateArticleDto,
    author: User,
  ): Promise<ArticleDto> {
    const slug = slugify(createArticleDto.title);

    const article = this.articlesRepository.create({
      ...createArticleDto,
      slug,
      author,
      authorId: author.id,
      tagList: createArticleDto.tagList || [],
    });

    const savedArticle = await this.articlesRepository.save(article);
    return this.toArticleDto(savedArticle, author, false);
  }

  /**
   * Get all articles with optional filtering and pagination
   * Ordered by creation date (newest first)
   * Supports filtering by:
   * - tag: Filter articles containing specific tag
   * - author: Filter articles by author username
   * - favorited: Filter articles favorited by a specific user (username)
   * @param options - Query options (tag, author, favorited, limit, offset)
   * @param currentUser - Optional current user for checking if they favorited articles
   * @returns Object with articles array and total count
   */
  async findAll(
    options: {
      tag?: string;
      author?: string;
      favorited?: string;
      limit: number;
      offset: number;
    },
    currentUser?: User,
  ): Promise<{ articles: ArticleDto[]; total: number }> {
    let query = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.favoritedBy', 'favoritedBy');

    let whereConditionAdded = false;

    // Filter by tag
    if (options.tag) {
      query = query.where(`article.tagList LIKE :tag`, { tag: `%${options.tag}%` });
      whereConditionAdded = true;
    }

    // Filter by author username
    if (options.author) {
      const condition = `author.username = :author`;
      if (whereConditionAdded) {
        query = query.andWhere(condition, { author: options.author });
      } else {
        query = query.where(condition, { author: options.author });
        whereConditionAdded = true;
      }
    }

    // Filter by favorited user
    if (options.favorited) {
      const condition = `favoritedBy.username = :favoritedUser`;
      if (whereConditionAdded) {
        query = query.andWhere(condition, { favoritedUser: options.favorited });
      } else {
        query = query.where(condition, { favoritedUser: options.favorited });
        whereConditionAdded = true;
      }
    }

    // Order by creation date (newest first)
    query = query.orderBy('article.createdAt', 'DESC');

    // Get total count before pagination
    const total = await query.getCount();

    // Apply pagination
    const articles = await query
      .skip(options.offset)
      .take(options.limit)
      .getMany();

    // Convert to DTOs with favorited status
    return {
      articles: articles.map((article) =>
        this.toArticleDto(
          article,
          currentUser,
          currentUser
            ? article.favoritedBy?.some((u) => u.id === currentUser.id)
            : false,
        ),
      ),
      total,
    };
  }

  /**
   * Get a single article by slug
   * @param slug - The article slug
   * @param currentUser - Optional current user for checking if they favorited the article
   * @returns The article as ArticleDto
   * @throws NotFoundException if article not found
   */
  async findOne(slug: string, currentUser?: User): Promise<ArticleDto> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'favoritedBy'],
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    const isFavorited = currentUser
      ? article.favoritedBy?.some((u) => u.id === currentUser.id)
      : false;

    return this.toArticleDto(article, currentUser, isFavorited);
  }

  /**
   * Update an article
   * Note: Slug is immutable after creation to preserve existing links/bookmarks
   * @param slug - The article slug
   * @param updateArticleDto - Updated article data
   * @param currentUser - The user requesting the update (must be the author)
   * @returns The updated article as ArticleDto
   * @throws NotFoundException if article not found
   * @throws ForbiddenException if user is not the article author
   */
  async update(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    currentUser: User,
  ): Promise<ArticleDto> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'favoritedBy'],
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    if (article.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own articles');
    }

    // Slug is immutable after creation to preserve existing links/bookmarks
    Object.assign(article, updateArticleDto);
    const updatedArticle = await this.articlesRepository.save(article);

    const isFavorited = article.favoritedBy?.some((u) => u.id === currentUser.id);
    return this.toArticleDto(updatedArticle, currentUser, isFavorited);
  }

  /**
   * Delete an article
   * @param slug - The article slug
   * @param currentUser - The user requesting the deletion (must be the author)
   * @throws NotFoundException if article not found
   * @throws ForbiddenException if user is not the article author
   */
  async remove(slug: string, currentUser: User): Promise<void> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    if (article.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await this.articlesRepository.remove(article);
  }

  /**
   * Add an article to the user's favorites
   * @param slug - The article slug
   * @param currentUser - The user favoriting the article
   * @returns The article as ArticleDto with favorited flag set to true
   * @throws NotFoundException if article or user not found
   */
  async favorite(slug: string, currentUser: User): Promise<ArticleDto> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'favoritedBy'],
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAlreadyFavorited = article.favoritedBy?.some(
      (u) => u.id === currentUser.id,
    );

    if (!isAlreadyFavorited) {
      article.favoritedBy.push(user);
      article.favoritesCount += 1;
      await this.articlesRepository.save(article);

      // Reload article with updated relations to ensure client receives correct state
      const updatedArticle = await this.articlesRepository.findOne({
        where: { slug },
        relations: ['author', 'favoritedBy'],
      });

      if (updatedArticle) {
        return this.toArticleDto(updatedArticle, currentUser, true);
      }
    }

    return this.toArticleDto(article, currentUser, true);
  }

  /**
   * Remove an article from the user's favorites
   * @param slug - The article slug
   * @param currentUser - The user unfavoriting the article
   * @returns The article as ArticleDto with favorited flag set to false
   * @throws NotFoundException if article not found
   */
  async unfavorite(slug: string, currentUser: User): Promise<ArticleDto> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'favoritedBy'],
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    const isFavorited = article.favoritedBy?.some(
      (u) => u.id === currentUser.id,
    );

    if (isFavorited) {
      article.favoritedBy = article.favoritedBy.filter(
        (u) => u.id !== currentUser.id,
      );
      article.favoritesCount = Math.max(0, article.favoritesCount - 1);
      await this.articlesRepository.save(article);

      // Reload article with updated relations to ensure client receives correct state
      const updatedArticle = await this.articlesRepository.findOne({
        where: { slug },
        relations: ['author', 'favoritedBy'],
      });

      if (updatedArticle) {
        return this.toArticleDto(updatedArticle, currentUser, false);
      }
    }

    return this.toArticleDto(article, currentUser, false);
  }

  private toArticleDto(
    article: Article,
    currentUser?: User,
    isFavorited: boolean = false,
  ): ArticleDto {
    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList || [],
      createdAt: article.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: article.updatedAt?.toISOString() || new Date().toISOString(),
      favorited: isFavorited,
      favoritesCount: article.favoritesCount,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following: false, // This should be implemented based on follow logic
      },
    };
  }
}
