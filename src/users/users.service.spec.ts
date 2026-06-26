import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;
  let usersRepository: any;

  const mockUser: User = {
    id: 1,
    email: 'jake@jake.jake',
    username: 'Jake',
    passwordHash: 'hashed_password',
    bio: 'I like to skateboard',
    image: 'https://i.stack.imgur.com/xHWG8.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.login('jake@jake.jake', 'jakejake12');

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('jake@jake.jake');
      expect(result.user.username).toBe('Jake');
      expect(result.user.bio).toBe('I like to skateboard');
      expect(result.user.image).toBe('https://i.stack.imgur.com/xHWG8.jpg');
      expect(result.user.token).toBe('test-token');
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login('jake@jake.jake', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with non-existent email', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.login('notfound@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException when email is missing', async () => {
      await expect(service.login('   ', 'password')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is missing', async () => {
      await expect(service.login('jake@jake.jake', '   ')).rejects.toThrow(BadRequestException);
    });

    it('should generate JWT token on successful login', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(mockUser);

      await service.login('jake@jake.jake', 'jakejake12');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: 'jake@jake.jake',
      });
    });

    it('should throw BadRequestException on database error', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.login('jake@jake.jake', 'password')).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should successfully create a new user with valid data', async () => {
      const createUserDto = {
        email: 'NEWUSER@EXAMPLE.COM',
        username: 'NewUser',
        password: 'password123',
      };

      const newUser: User = {
        id: 2,
        email: 'newuser@example.com',
        username: 'NewUser',
        passwordHash: 'hashed_password',
        bio: undefined,
        image: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user.id).toBe(2);
      expect(result.user.email).toBe('newuser@example.com'); // Normalized to lowercase
      expect(result.user.username).toBe('NewUser');
      expect(result.user.token).toBe('test-token');
    });

    it('should hash the password before saving', async () => {
      const createUserDto = {
        email: 'hashtest@example.com',
        username: 'HashTest',
        password: 'plainpassword123',
      };

      const newUser: User = {
        id: 3,
        email: 'hashtest@example.com',
        username: 'HashTest',
        passwordHash: 'hashed_password',
        bio: undefined,
        image: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword123', expect.any(Number));
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto = {
        email: 'JAKE@JAKE.JAKE',
        username: 'Jake2',
        password: 'password123',
      };

      usersRepository.findOne.mockResolvedValue(mockUser); // Will match normalized email

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when email is missing', async () => {
      const createUserDto = {
        email: '   ',
        username: 'User',
        password: 'password123',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when username is missing', async () => {
      const createUserDto = {
        email: 'user@example.com',
        username: '   ',
        password: 'password123',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is missing', async () => {
      const createUserDto = {
        email: 'user@example.com',
        username: 'User',
        password: '   ',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should save the user with hashed password', async () => {
      const createUserDto = {
        email: 'savetest@example.com',
        username: 'SaveTest',
        password: 'password123',
      };

      const newUser: User = {
        id: 4,
        email: 'savetest@example.com',
        username: 'SaveTest',
        passwordHash: 'hashed_password',
        bio: undefined,
        image: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      await service.create(createUserDto);

      expect(usersRepository.create).toHaveBeenCalledWith({
        email: 'savetest@example.com', // Normalized
        username: 'SaveTest',
        passwordHash: 'hashed_password',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should generate JWT token for new user', async () => {
      const createUserDto = {
        email: 'jwttest@example.com',
        username: 'JwtTest',
        password: 'password123',
      };

      const newUser: User = {
        id: 5,
        email: 'jwttest@example.com',
        username: 'JwtTest',
        passwordHash: 'hashed_password',
        bio: undefined,
        image: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      await service.create(createUserDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 5,
        email: 'jwttest@example.com',
      });
    });

    it('should throw BadRequestException on database error', async () => {
      const createUserDto = {
        email: 'user@example.com',
        username: 'User',
        password: 'password123',
      };

      usersRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data without token', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(1);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('jake@jake.jake');
      expect(result.user.username).toBe('Jake');
      expect(result.user.bio).toBe('I like to skateboard');
      expect(result.user.image).toBe('https://i.stack.imgur.com/xHWG8.jpg');
      expect(result.user.token).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.getCurrentUser(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on database error', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getCurrentUser(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should successfully update user', async () => {
      const updateUserDto = {
        username: 'UpdatedJake',
        bio: 'Updated bio',
        image: 'https://updated-image.jpg',
      };

      const updatedUser: User = {
        ...mockUser,
        username: 'UpdatedJake',
        bio: 'Updated bio',
        image: 'https://updated-image.jpg',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user.username).toBe('UpdatedJake');
      expect(result.user.bio).toBe('Updated bio');
      expect(result.user.image).toBe('https://updated-image.jpg');
      expect(result.user.token).toBeUndefined();
    });

    it('should update email if not already taken', async () => {
      const updateUserDto = {
        email: 'newemail@example.com',
      };

      const updatedUser: User = {
        ...mockUser,
        email: 'newemail@example.com',
      };

      usersRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call: find user
        .mockResolvedValueOnce(null); // Second call: check if email exists

      usersRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result.user.email).toBe('newemail@example.com'.toLowerCase());
    });

    it('should throw ConflictException if email already exists', async () => {
      const updateUserDto = {
        email: 'EXISTING@EXAMPLE.COM',
      };

      const existingUser: User = {
        ...mockUser,
        id: 2,
        email: 'existing@example.com',
      };

      usersRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call: find user
        .mockResolvedValueOnce(existingUser); // Second call: email exists

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should hash password if provided', async () => {
      const updateUserDto = {
        password: 'newpassword123',
      };

      const updatedUser: User = {
        ...mockUser,
        passwordHash: 'new_hashed_password',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      usersRepository.findOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue(updatedUser);

      await service.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', expect.any(Number));
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on database error', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, {})).rejects.toThrow(BadRequestException);
    });

    it('should save user with partial updates', async () => {
      const updateUserDto = {
        bio: 'Updated bio only',
      };

      const updatedUser: User = {
        ...mockUser,
        bio: 'Updated bio only',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue(updatedUser);

      await service.update(1, updateUserDto);

      expect(usersRepository.save).toHaveBeenCalled();
    });
  });
});

