import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
    following: [],
    followers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArticleDto = {
    slug: 'test-article',
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body',
    tagList: ['test', 'article'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
      following: false,
    },
  };

  const mockArticlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    favorite: jest.fn(),
    unfavorite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an article and return SingleArticleResponseDto', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test Article',
        description: 'Test description',
        body: 'Test body',
        tagList: ['test', 'article'],
      };

      mockArticlesService.create.mockResolvedValue(mockArticleDto);

      const result = await controller.create(createArticleDto, { user: mockUser });

      expect(result).toHaveProperty('article');
      expect(result.article.title).toBe('Test Article');
      expect(mockArticlesService.create).toHaveBeenCalledWith(
        createArticleDto,
        mockUser,
      );
    });

    it('should pass user from request to service', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test Article',
        description: 'Test description',
        body: 'Test body',
      };

      mockArticlesService.create.mockResolvedValue(mockArticleDto);

      await controller.create(createArticleDto, { user: mockUser });

      expect(mockArticlesService.create).toHaveBeenCalledWith(
        createArticleDto,
        mockUser,
      );
    });
  });

  describe('findAll', () => {
    it('should return all articles with default pagination', async () => {
      const articles = [mockArticleDto, { ...mockArticleDto, slug: 'another-article' }];
      mockArticlesService.findAll.mockResolvedValue({
        articles,
        total: 2,
      });

      const query = { limit: 20, offset: 0 };
      const result = await controller.findAll(query);

      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('articlesCount');
      expect(result.articles).toHaveLength(2);
      expect(result.articlesCount).toBe(2);
    });

    it('should pass query parameters to service', async () => {
      mockArticlesService.findAll.mockResolvedValue({
        articles: [mockArticleDto],
        total: 1,
      });

      const query = { tag: 'test', limit: 10, offset: 0 };
      await controller.findAll(query, { user: mockUser });

      expect(mockArticlesService.findAll).toHaveBeenCalledWith(
        {
          tag: 'test',
          author: undefined,
          favorited: undefined,
          limit: 10,
          offset: 0,
        },
        mockUser,
      );
    });

    it('should pass author filter to service', async () => {
      mockArticlesService.findAll.mockResolvedValue({
        articles: [mockArticleDto],
        total: 1,
      });

      const query = { author: 'jake', limit: 20, offset: 0 };
      await controller.findAll(query);

      expect(mockArticlesService.findAll).toHaveBeenCalledWith(
        {
          tag: undefined,
          author: 'jake',
          favorited: undefined,
          limit: 20,
          offset: 0,
        },
        undefined,
      );
    });

    it('should pass favorited filter to service', async () => {
      mockArticlesService.findAll.mockResolvedValue({
        articles: [mockArticleDto],
        total: 1,
      });

      const query = { favorited: 'jake', limit: 20, offset: 0 };
      await controller.findAll(query);

      expect(mockArticlesService.findAll).toHaveBeenCalledWith(
        {
          tag: undefined,
          author: undefined,
          favorited: 'jake',
          limit: 20,
          offset: 0,
        },
        undefined,
      );
    });

    it('should handle current user for favorited status', async () => {
      mockArticlesService.findAll.mockResolvedValue({
        articles: [mockArticleDto],
        total: 1,
      });

      const query = { limit: 20, offset: 0 };
      await controller.findAll(query, { user: mockUser });

      expect(mockArticlesService.findAll).toHaveBeenCalledWith(
        {
          tag: undefined,
          author: undefined,
          favorited: undefined,
          limit: 20,
          offset: 0,
        },
        mockUser,
      );
    });

    it('should return correct article count from service', async () => {
      const articles = Array(5).fill(mockArticleDto);
      mockArticlesService.findAll.mockResolvedValue({
        articles,
        total: 100,
      });

      const query = { limit: 5, offset: 0 };
      const result = await controller.findAll(query);

      expect(result.articlesCount).toBe(100);
      expect(result.articles).toHaveLength(5);
    });
  });

  describe('findOne', () => {
    it('should return a single article by slug', async () => {
      mockArticlesService.findOne.mockResolvedValue(mockArticleDto);

      const result = await controller.findOne('test-article');

      expect(result).toHaveProperty('article');
      expect(result.article.slug).toBe('test-article');
      expect(mockArticlesService.findOne).toHaveBeenCalledWith('test-article', undefined);
    });

    it('should pass current user to service', async () => {
      mockArticlesService.findOne.mockResolvedValue(mockArticleDto);

      await controller.findOne('test-article', { user: mockUser });

      expect(mockArticlesService.findOne).toHaveBeenCalledWith('test-article', mockUser);
    });

    it('should handle article not found', async () => {
      mockArticlesService.findOne.mockRejectedValue(
        new NotFoundException('Article not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Title',
      };

      const updatedArticle = { ...mockArticleDto, title: 'Updated Title' };
      mockArticlesService.update.mockResolvedValue(updatedArticle);

      const result = await controller.update('test-article', updateArticleDto, {
        user: mockUser,
      });

      expect(result).toHaveProperty('article');
      expect(result.article.title).toBe('Updated Title');
      expect(mockArticlesService.update).toHaveBeenCalledWith(
        'test-article',
        updateArticleDto,
        mockUser,
      );
    });

    it('should handle article not found on update', async () => {
      const updateArticleDto: UpdateArticleDto = { title: 'Updated' };
      mockArticlesService.update.mockRejectedValue(
        new NotFoundException('Article not found'),
      );

      await expect(
        controller.update('non-existent', updateArticleDto, { user: mockUser }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle forbidden exception when not author', async () => {
      const updateArticleDto: UpdateArticleDto = { title: 'Updated' };
      mockArticlesService.update.mockRejectedValue(
        new ForbiddenException('You can only update your own articles'),
      );

      await expect(
        controller.update('test-article', updateArticleDto, { user: mockUser }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete an article', async () => {
      mockArticlesService.remove.mockResolvedValue(undefined);

      await controller.remove('test-article', { user: mockUser });

      expect(mockArticlesService.remove).toHaveBeenCalledWith('test-article', mockUser);
    });

    it('should return no content (void)', async () => {
      mockArticlesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('test-article', { user: mockUser });

      expect(result).toBeUndefined();
    });

    it('should handle article not found on delete', async () => {
      mockArticlesService.remove.mockRejectedValue(
        new NotFoundException('Article not found'),
      );

      await expect(controller.remove('non-existent', { user: mockUser })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle forbidden exception when not author', async () => {
      mockArticlesService.remove.mockRejectedValue(
        new ForbiddenException('You can only delete your own articles'),
      );

      await expect(controller.remove('test-article', { user: mockUser })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('favorite', () => {
    it('should favorite an article', async () => {
      const favoritedArticle = { ...mockArticleDto, favorited: true, favoritesCount: 1 };
      mockArticlesService.favorite.mockResolvedValue(favoritedArticle);

      const result = await controller.favorite('test-article', { user: mockUser });

      expect(result).toHaveProperty('article');
      expect(result.article.favorited).toBe(true);
      expect(mockArticlesService.favorite).toHaveBeenCalledWith('test-article', mockUser);
    });

    it('should increase favorites count', async () => {
      const favoritedArticle = { ...mockArticleDto, favorited: true, favoritesCount: 1 };
      mockArticlesService.favorite.mockResolvedValue(favoritedArticle);

      const result = await controller.favorite('test-article', { user: mockUser });

      expect(result.article.favoritesCount).toBe(1);
    });

    it('should handle article not found on favorite', async () => {
      mockArticlesService.favorite.mockRejectedValue(
        new NotFoundException('Article not found'),
      );

      await expect(controller.favorite('non-existent', { user: mockUser })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unfavorite', () => {
    it('should unfavorite an article', async () => {
      const unfavoritedArticle = {
        ...mockArticleDto,
        favorited: false,
        favoritesCount: 0,
      };
      mockArticlesService.unfavorite.mockResolvedValue(unfavoritedArticle);

      const result = await controller.unfavorite('test-article', { user: mockUser });

      expect(result).toHaveProperty('article');
      expect(result.article.favorited).toBe(false);
      expect(mockArticlesService.unfavorite).toHaveBeenCalledWith('test-article', mockUser);
    });

    it('should decrease favorites count', async () => {
      const unfavoritedArticle = {
        ...mockArticleDto,
        favorited: false,
        favoritesCount: 0,
      };
      mockArticlesService.unfavorite.mockResolvedValue(unfavoritedArticle);

      const result = await controller.unfavorite('test-article', { user: mockUser });

      expect(result.article.favoritesCount).toBe(0);
    });

    it('should handle article not found on unfavorite', async () => {
      mockArticlesService.unfavorite.mockRejectedValue(
        new NotFoundException('Article not found'),
      );

      await expect(controller.unfavorite('non-existent', { user: mockUser })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
