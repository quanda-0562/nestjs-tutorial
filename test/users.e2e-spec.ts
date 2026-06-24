import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';

jest.mock('bcrypt');

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let usersRepository: any;

  const mockUser: User = {
    id: 1,
    email: 'jake@jake.jake',
    username: 'Jake',
    passwordHash: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users/login', () => {
    it('should successfully login with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'jakejake12',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'jake@jake.jake');
      expect(response.body.user).toHaveProperty('token');
      expect(typeof response.body.user.token).toBe('string');
      expect(response.body.user.token.length).toBeGreaterThan(0);
    });

    it('should return 401 with invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersRepository.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'wrongpassword',
          },
        });

      expect(response.status).toBe(401);
      // Message can be the i18n key, translated text, or HTTP status message
      expect([
        'auth.invalidEmailOrPassword',
        'Invalid email or password',
        'Unauthorized',
      ]).toContain(response.body.message);
    });

    it('should return 401 with non-existent email', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'notfound@example.com',
            password: 'password12345',
          },
        });

      expect(response.status).toBe(401);
      // Message can be the i18n key, translated text, or HTTP status message
      expect([
        'auth.invalidEmailOrPassword',
        'Invalid email or password',
        'Unauthorized',
      ]).toContain(response.body.message);
    });

    it('should return 400 with missing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            password: 'jakejake12',
          },
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
          },
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'invalid-email',
            password: 'password12345',
          },
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should return 400 with password too short', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'short',
          },
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should return token with correct format (JWT)', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'jakejake12',
          },
        });

      const token = response.body.user.token;
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should return user with id and email', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'jakejake12',
          },
        });

      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.email).toBe('jake@jake.jake');
    });
  });
});

