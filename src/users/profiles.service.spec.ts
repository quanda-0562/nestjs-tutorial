import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProfilesService } from './profiles.service';
import { User } from './entities/user.entity';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    email: 'jake@jake.jake',
    username: 'jake',
    passwordHash: 'hashed_password',
    bio: 'I work at statefarm',
    image: 'https://api.realworld.io/images/smiley-cyrus.jpg',
    following: [],
    followers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOtherUser: User = {
    id: 2,
    email: 'other@example.com',
    username: 'other',
    passwordHash: 'hashed_password',
    bio: 'Other user bio',
    image: 'https://example.com/image.jpg',
    following: [],
    followers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile with following false when no current user', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('jake');

      expect(result.profile.username).toBe('jake');
      expect(result.profile.bio).toBe('I work at statefarm');
      expect(result.profile.image).toBe(
        'https://api.realworld.io/images/smiley-cyrus.jpg',
      );
      expect(result.profile.following).toBe(false);
    });

    it('should return profile with following false when current user is not following', async () => {
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser) // findOne for getProfile
        .mockResolvedValueOnce({ ...mockUser, following: [] }); // findOne for isUserFollowing

      const result = await service.getProfile('jake', 2);

      expect(result.profile.following).toBe(false);
    });

    it('should return profile with following true when current user is following', async () => {
      const currentUserWithFollowing = { ...mockOtherUser, following: [mockUser] };
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser) // findOne for getProfile
        .mockResolvedValueOnce(currentUserWithFollowing); // findOne for isUserFollowing

      const result = await service.getProfile('jake', 2);

      expect(result.profile.following).toBe(true);
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should query with username parameter', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      await service.getProfile('jake');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'jake' },
      });
    });
  });

  describe('followUser', () => {
    it('should add user to following list', async () => {
      const userWithFollowing = { ...mockUser, following: [] };
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockOtherUser) // findOne for userToFollow
        .mockResolvedValueOnce(userWithFollowing); // findOne for currentUser with relations
      mockUsersRepository.save.mockResolvedValue(userWithFollowing);

      const result = await service.followUser('other', 1);

      expect(result.profile.username).toBe('other');
      expect(result.profile.following).toBe(true);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          following: expect.arrayContaining([mockOtherUser]),
        }),
      );
    });

    it('should not add duplicate follow', async () => {
      const userWithFollowing = { ...mockUser, following: [mockOtherUser] };
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockOtherUser) // findOne for userToFollow
        .mockResolvedValueOnce(userWithFollowing); // findOne for currentUser with relations
      mockUsersRepository.save.mockResolvedValue(userWithFollowing);

      const result = await service.followUser('other', 1);

      expect(result.profile.following).toBe(true);
      // save should not be called for duplicate
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to follow self', async () => {
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser); // findOne for userToFollow

      await expect(service.followUser('jake', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when target user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.followUser('nonexistent', 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when current user not found', async () => {
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockOtherUser)
        .mockResolvedValueOnce(null);

      await expect(service.followUser('other', 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unfollowUser', () => {
    it('should remove user from following list', async () => {
      const userWithFollowing = { ...mockUser, following: [mockOtherUser] };
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockOtherUser) // findOne for userToUnfollow
        .mockResolvedValueOnce(userWithFollowing); // findOne for currentUser with relations
      mockUsersRepository.save.mockResolvedValue({
        ...userWithFollowing,
        following: [],
      });

      const result = await service.unfollowUser('other', 1);

      expect(result.profile.following).toBe(false);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          following: expect.not.arrayContaining([mockOtherUser]),
        }),
      );
    });

    it('should handle unfollowing when not following', async () => {
      const userWithoutFollowing = { ...mockUser, following: [] };
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockOtherUser) // findOne for userToUnfollow
        .mockResolvedValueOnce(userWithoutFollowing); // findOne for currentUser with relations

      const result = await service.unfollowUser('other', 1);

      expect(result.profile.following).toBe(false);
      // save should not be called if not already following
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when target user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.unfollowUser('nonexistent', 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when current user not found', async () => {
      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockOtherUser)
        .mockResolvedValueOnce(null);

      await expect(service.unfollowUser('other', 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
