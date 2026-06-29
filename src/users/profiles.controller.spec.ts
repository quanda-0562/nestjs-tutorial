import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto } from './dto/profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

// Mock JWT Guard
const mockJwtGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let service: ProfilesService;

  const mockProfileResponse: ProfileResponseDto = {
    profile: {
      username: 'jake',
      bio: 'I work at statefarm',
      image: 'https://api.realworld.io/images/smiley-cyrus.jpg',
      following: false,
    },
  };

  const mockProfilesService = {
    getProfile: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtGuard,
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    service = module.get<ProfilesService>(ProfilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return a profile', async () => {
      mockProfilesService.getProfile.mockResolvedValue(mockProfileResponse);

      const result = await controller.getProfile('jake', {});

      expect(result).toEqual(mockProfileResponse);
      expect(service.getProfile).toHaveBeenCalledWith('jake', undefined);
    });

    it('should pass currentUserId when user is authenticated', async () => {
      mockProfilesService.getProfile.mockResolvedValue(mockProfileResponse);

      const result = await controller.getProfile('jake', { user: { userId: 1 } });

      expect(result).toEqual(mockProfileResponse);
      expect(service.getProfile).toHaveBeenCalledWith('jake', 1);
    });

    it('should call service with username parameter', async () => {
      mockProfilesService.getProfile.mockResolvedValue(mockProfileResponse);

      await controller.getProfile('jake', {});

      expect(service.getProfile).toHaveBeenCalledWith('jake', undefined);
    });
  });

  describe('followUser', () => {
    it('should follow a user and return profile with following true', async () => {
      const followingProfile: ProfileResponseDto = {
        profile: {
          ...mockProfileResponse.profile,
          following: true,
        },
      };

      mockProfilesService.followUser.mockResolvedValue(followingProfile);

      const result = await controller.followUser('jake', { user: { userId: 1 } });

      expect(result.profile.following).toBe(true);
      expect(service.followUser).toHaveBeenCalledWith('jake', 1);
    });

    it('should pass correct parameters to service', async () => {
      mockProfilesService.followUser.mockResolvedValue(mockProfileResponse);

      await controller.followUser('otheruser', { user: { userId: 2 } });

      expect(service.followUser).toHaveBeenCalledWith('otheruser', 2);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user and return profile with following false', async () => {
      mockProfilesService.unfollowUser.mockResolvedValue(mockProfileResponse);

      const result = await controller.unfollowUser('jake', { user: { userId: 1 } });

      expect(result.profile.following).toBe(false);
      expect(service.unfollowUser).toHaveBeenCalledWith('jake', 1);
    });

    it('should pass correct parameters to service', async () => {
      mockProfilesService.unfollowUser.mockResolvedValue(mockProfileResponse);

      await controller.unfollowUser('otheruser', { user: { userId: 2 } });

      expect(service.unfollowUser).toHaveBeenCalledWith('otheruser', 2);
    });
  });
});
