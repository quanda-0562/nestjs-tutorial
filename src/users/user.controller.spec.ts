import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersService } from './users.service';
import { UpdateUserRequestDto, UserResponseDto } from './dto/user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    email: 'jake@jake.jake',
    username: 'Jake',
    bio: 'I like to skateboard',
    image: 'https://i.stack.imgur.com/xHWG8.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getCurrentUser: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should call service.getCurrentUser with correct userId', async () => {
      const req = { user: { userId: 1 } };
      const mockResponse: UserResponseDto = {
        user: mockUser,
      };

      (service.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse);

      await controller.getCurrentUser(req);

      expect(service.getCurrentUser).toHaveBeenCalledWith(1);
    });

    it('should return user data successfully', async () => {
      const req = { user: { userId: 1 } };
      const mockResponse: UserResponseDto = {
        user: mockUser,
      };

      (service.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.getCurrentUser(req);

      expect(result).toEqual(mockResponse);
      expect(result.user).toHaveProperty('id', 1);
      expect(result.user).toHaveProperty('email', 'jake@jake.jake');
      expect(result.user).toHaveProperty('username', 'Jake');
    });

    it('should include bio and image in response', async () => {
      const req = { user: { userId: 1 } };
      const mockResponse: UserResponseDto = {
        user: mockUser,
      };

      (service.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.getCurrentUser(req);

      expect(result.user).toHaveProperty('bio', 'I like to skateboard');
      expect(result.user).toHaveProperty('image', 'https://i.stack.imgur.com/xHWG8.jpg');
    });

    it('should propagate NotFoundException when user not found', async () => {
      const req = { user: { userId: 999 } };

      (service.getCurrentUser as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.getCurrentUser(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should call service.update with correct userId and data', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          email: 'newemail@example.com',
          username: 'Jake Updated',
        },
      };
      const mockResponse: UserResponseDto = {
        user: {
          ...mockUser,
          email: 'newemail@example.com',
          username: 'Jake Updated',
        },
      };

      (service.update as jest.Mock).mockResolvedValue(mockResponse);

      await controller.update(req, updateRequest);

      expect(service.update).toHaveBeenCalledWith(1, {
        email: 'newemail@example.com',
        username: 'Jake Updated',
      });
    });

    it('should return updated user data', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          bio: 'New bio',
        },
      };
      const mockResponse: UserResponseDto = {
        user: {
          ...mockUser,
          bio: 'New bio',
        },
      };

      (service.update as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.update(req, updateRequest);

      expect(result).toEqual(mockResponse);
      expect(result.user.bio).toBe('New bio');
    });

    it('should handle updating only email', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          email: 'updated@example.com',
        },
      };
      const mockResponse: UserResponseDto = {
        user: {
          ...mockUser,
          email: 'updated@example.com',
        },
      };

      (service.update as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.update(req, updateRequest);

      expect(result.user.email).toBe('updated@example.com');
      expect(service.update).toHaveBeenCalledWith(1, { email: 'updated@example.com' });
    });

    it('should handle updating only username', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          username: 'New Username',
        },
      };
      const mockResponse: UserResponseDto = {
        user: {
          ...mockUser,
          username: 'New Username',
        },
      };

      (service.update as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.update(req, updateRequest);

      expect(result.user.username).toBe('New Username');
    });

    it('should handle updating bio and image', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          bio: 'Updated bio',
          image: 'https://example.com/new-image.jpg',
        },
      };
      const mockResponse: UserResponseDto = {
        user: {
          ...mockUser,
          bio: 'Updated bio',
          image: 'https://example.com/new-image.jpg',
        },
      };

      (service.update as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.update(req, updateRequest);

      expect(result.user.bio).toBe('Updated bio');
      expect(result.user.image).toBe('https://example.com/new-image.jpg');
    });

    it('should propagate ConflictException when email already exists', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          email: 'existing@example.com',
        },
      };

      (service.update as jest.Mock).mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.update(req, updateRequest)).rejects.toThrow(ConflictException);
    });

    it('should propagate NotFoundException when user not found', async () => {
      const req = { user: { userId: 999 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          username: 'Updated',
        },
      };

      (service.update as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.update(req, updateRequest)).rejects.toThrow(NotFoundException);
    });

    it('should handle updating password', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          password: 'newpassword123',
        },
      };
      const mockResponse: UserResponseDto = {
        user: mockUser,
      };

      (service.update as jest.Mock).mockResolvedValue(mockResponse);

      await controller.update(req, updateRequest);

      expect(service.update).toHaveBeenCalledWith(1, {
        password: 'newpassword123',
      });
    });

    it('should handle updating multiple fields at once', async () => {
      const req = { user: { userId: 1 } };
      const updateRequest: UpdateUserRequestDto = {
        user: {
          email: 'newemail@example.com',
          username: 'New Name',
          bio: 'New bio',
          image: 'https://example.com/image.jpg',
          password: 'newpassword123',
        },
      };
      const mockResponse: UserResponseDto = {
        user: {
          id: 1,
          email: 'newemail@example.com',
          username: 'New Name',
          bio: 'New bio',
          image: 'https://example.com/image.jpg',
        },
      };

      (service.update as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.update(req, updateRequest);

      expect(service.update).toHaveBeenCalledWith(1, {
        email: 'newemail@example.com',
        username: 'New Name',
        bio: 'New bio',
        image: 'https://example.com/image.jpg',
        password: 'newpassword123',
      });
      expect(result.user.email).toBe('newemail@example.com');
      expect(result.user.username).toBe('New Name');
    });
  });
});
