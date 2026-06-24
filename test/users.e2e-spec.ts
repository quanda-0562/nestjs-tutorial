import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [UsersController],
      providers: [UsersService],
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
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'wrongpassword',
          },
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 with non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'notfound@example.com',
            password: 'password12345',
          },
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
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
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'jakejake12',
          },
        });

      expect(response.status).toBe(201);
      const token = response.body.user.token;
      const parts = token.split('.');

      expect(parts.length).toBe(3); // JWT has 3 parts
      expect(parts[0]).toBeTruthy(); // header
      expect(parts[1]).toBeTruthy(); // payload
      expect(parts[2]).toBeTruthy(); // signature
    });

    it('should return consistent user id for multiple logins', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'jakejake12',
          },
        });

      const response2 = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email: 'jake@jake.jake',
            password: 'jakejake12',
          },
        });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.user.id).toBe(response2.body.user.id);
    });
  });
});

