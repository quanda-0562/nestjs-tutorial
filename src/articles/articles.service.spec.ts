import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let mockArticleRepository: any;
  let mockCommentRepository: any;
  let mockUserRepository: any;

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

  const mockArticle: Article = {
    id: 1,
    slug: 'test-article',
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body',
    tagList: ['test', 'article'],
    createdAt: new Date(),
    updatedAt: new Date(),
    favoritesCount: 0,
    author: mockUser,
    authorId: 1,
    favoritedBy: [],
  };

  const mockComment: Comment = {
    id: 1,
    body: 'His name was my name too.',
    createdAt: new Date(),
    article: mockArticle,
    articleId: mockArticle.id,
    author: mockUser,
    authorId: mockUser.id,
  };

  /**
   * Helper function to create a fresh copy of mockArticle
   * to avoid test pollution from mutations
   */
  const createMockArticle = (): Article => ({
    id: 1,
    slug: 'test-article',
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body',
    tagList: ['test', 'article'],
    createdAt: new Date(),
    updatedAt: new Date(),
    favoritesCount: 0,
    author: { ...mockUser },
    authorId: 1,
    favoritedBy: [],
  });

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock repositories
    mockArticleRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockCommentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe('create', () => {
    it('should create an article successfully', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test Article',
        description: 'Test description',
        body: 'Test body',
        tagList: ['test', 'article'],
      };

      const createdArticle = { ...mockArticle, ...createArticleDto };

      mockArticleRepository.create.mockReturnValue(createdArticle);
      mockArticleRepository.save.mockResolvedValue(createdArticle);

      const result = await service.create(createArticleDto, mockUser);

      expect(result.title).toBe('Test Article');
      expect(result.slug).toBe('test-article');
      expect(result.favorited).toBe(false);
      expect(mockArticleRepository.create).toHaveBeenCalled();
      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it('should generate slug from title', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'How to Train Your Dragon',
        description: 'Test description',
        body: 'Test body',
      };

      mockArticleRepository.create.mockReturnValue({
        ...mockArticle,
        ...createArticleDto,
        slug: 'how-to-train-your-dragon',
      });
      mockArticleRepository.save.mockResolvedValue({
        ...mockArticle,
        ...createArticleDto,
        slug: 'how-to-train-your-dragon',
      });

      const result = await service.create(createArticleDto, mockUser);

      expect(result.slug).toBe('how-to-train-your-dragon');
    });
  });

  describe('findAll', () => {
    it('should return all articles with pagination', async () => {
      const articles = [mockArticle, { ...mockArticle, id: 2, title: 'Another Article' }];
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(articles),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        limit: 20,
        offset: 0,
      });

      expect(result.articles).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.articles[0].title).toBe('Test Article');
    });

    it('should return empty array when no articles exist', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        limit: 20,
        offset: 0,
      });

      expect(result.articles).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter articles by tag', async () => {
      const articles = [mockArticle];
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(articles),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        tag: 'test',
        limit: 20,
        offset: 0,
      });

      expect(result.articles).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `article.tagList LIKE :tag`,
        { tag: '%test%' }
      );
    });

    it('should filter articles by author', async () => {
      const articles = [mockArticle];
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(articles),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        author: 'testuser',
        limit: 20,
        offset: 0,
      });

      expect(result.articles).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'author.username = :author',
        { author: 'testuser' }
      );
    });

    it('should filter articles by favorited user', async () => {
      const articles = [mockArticle];
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(articles),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        favorited: 'testuser',
        limit: 20,
        offset: 0,
      });

      expect(result.articles).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'favoritedBy.username = :favoritedUser',
        { favoritedUser: 'testuser' }
      );
    });

    it('should apply pagination with limit and offset', async () => {
      const articles = [mockArticle];
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(articles),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        limit: 10,
        offset: 5,
      });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.articles).toHaveLength(1);
    });

    it('should check if current user has favorited articles', async () => {
      const articleWithFavorites = { ...mockArticle, favoritedBy: [mockUser] };
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([articleWithFavorites]),
      };

      mockArticleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        limit: 20,
        offset: 0,
      }, mockUser);

      expect(result.articles[0].favorited).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return an article by slug', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      const result = await service.findOne('test-article');

      expect(result.slug).toBe('test-article');
      expect(result.title).toBe('Test Article');
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-article' },
        relations: ['author', 'favoritedBy'],
      });
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check if current user has favorited the article', async () => {
      const articleWithFavorites = { ...mockArticle, favoritedBy: [mockUser] };
      mockArticleRepository.findOne.mockResolvedValue(articleWithFavorites);

      const result = await service.findOne('test-article', mockUser);

      expect(result.favorited).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an article successfully', async () => {
      const updateArticleDto: UpdateArticleDto = {
        description: 'Updated description',
        body: 'Updated body',
      };

      const mockArticleForUpdate = createMockArticle();
      const updatedArticle = { ...mockArticleForUpdate, ...updateArticleDto };

      mockArticleRepository.findOne.mockResolvedValue(mockArticleForUpdate);
      mockArticleRepository.save.mockResolvedValue(updatedArticle);

      const result = await service.update('test-article', updateArticleDto, mockUser);

      expect(result.description).toBe('Updated description');
      expect(result.body).toBe('Updated body');
      expect(mockArticleRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      const updateArticleDto: UpdateArticleDto = { body: 'Updated' };

      await expect(
        service.update('non-existent', updateArticleDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const otherUser: User = { ...mockUser, id: 2 };
      mockArticleRepository.findOne.mockResolvedValue(createMockArticle());

      const updateArticleDto: UpdateArticleDto = { body: 'Updated' };

      await expect(
        service.update('test-article', updateArticleDto, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update article description and body', async () => {
      const updateArticleDto: UpdateArticleDto = {
        description: 'New description',
        body: 'New body content',
      };

      const mockArticleForUpdate = createMockArticle();
      mockArticleRepository.findOne.mockResolvedValue(mockArticleForUpdate);
      mockArticleRepository.save.mockResolvedValue({
        ...mockArticleForUpdate,
        ...updateArticleDto,
      });

      const result = await service.update('test-article', updateArticleDto, mockUser);

      expect(result.description).toBe('New description');
      expect(result.body).toBe('New body content');
    });
  });

  describe('remove', () => {
    it('should delete an article successfully', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      await service.remove('test-article', mockUser);

      expect(mockArticleRepository.remove).toHaveBeenCalledWith(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const otherUser: User = { ...mockUser, id: 2 };
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      await expect(service.remove('test-article', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('favorite', () => {
    it('should favorite an article successfully', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockArticleRepository.save.mockResolvedValue({
        ...mockArticle,
        favoritedBy: [mockUser],
        favoritesCount: 1,
      });

      const result = await service.favorite('test-article', mockUser);

      expect(result.favorited).toBe(true);
      expect(result.favoritesCount).toBe(1);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.favorite('non-existent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.favorite('test-article', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not increase favoritesCount if already favorited', async () => {
      const favoritedArticle = {
        ...mockArticle,
        favoritedBy: [mockUser],
        favoritesCount: 1,
      };

      mockArticleRepository.findOne.mockResolvedValue(favoritedArticle);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.favorite('test-article', mockUser);

      expect(mockArticleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('unfavorite', () => {
    it('should unfavorite an article successfully', async () => {
      const favoritedArticle = {
        ...mockArticle,
        favoritedBy: [mockUser],
        favoritesCount: 1,
      };

      mockArticleRepository.findOne.mockResolvedValue(favoritedArticle);
      mockArticleRepository.save.mockResolvedValue({
        ...favoritedArticle,
        favoritedBy: [],
        favoritesCount: 0,
      });

      const result = await service.unfavorite('test-article', mockUser);

      expect(result.favorited).toBe(false);
      expect(result.favoritesCount).toBe(0);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.unfavorite('non-existent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not decrease favoritesCount if not favorited', async () => {
      mockArticleRepository.findOne.mockResolvedValue(createMockArticle());

      const result = await service.unfavorite('test-article', mockUser);

      expect(result.favorited).toBe(false);
      expect(mockArticleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('addComment', () => {
    it('should add a comment successfully', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockReturnValue(mockComment);
      mockCommentRepository.save.mockResolvedValue(mockComment);

      const result = await service.addComment(
        'test-article',
        'His name was my name too.',
        mockUser,
      );

      expect(result.body).toBe('His name was my name too.');
      expect(result.author.username).toBe('testuser');
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        body: 'His name was my name too.',
        article: mockArticle,
        articleId: mockArticle.id,
        author: mockUser,
        authorId: mockUser.id,
      });
      expect(mockCommentRepository.save).toHaveBeenCalledWith(mockComment);
    });

    it('should throw NotFoundException if article does not exist', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addComment('missing-article', 'Test comment', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if current user does not exist', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addComment('test-article', 'Test comment', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    it('should return comments for an article', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockCommentRepository.find.mockResolvedValue([mockComment]);

      const result = await service.getComments('test-article');

      expect(result).toHaveLength(1);
      expect(result[0].body).toBe('His name was my name too.');
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
        where: { articleId: mockArticle.id },
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException if article is missing while fetching comments', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.getComments('missing-article')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.remove.mockResolvedValue(mockComment);

      await service.deleteComment('test-article', 1, mockUser);

      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          articleId: mockArticle.id,
        },
      });
      expect(mockCommentRepository.remove).toHaveBeenCalledWith(mockComment);
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteComment('test-article', 99, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the comment author', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockCommentRepository.findOne.mockResolvedValue({
        ...mockComment,
        authorId: 2,
      });

      await expect(service.deleteComment('test-article', 1, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
