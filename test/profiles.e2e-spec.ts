import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { User } from '../users/entities/user.entity';
import { getConnection } from 'typeorm';

describe('Profiles (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let otherUserToken: string;
  let testUsername: string;
  let otherUsername: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/profiles/:username', () => {
    beforeAll(async () => {
      // Create test users
      const signupRes1 = await request(app.getHttpServer())
        .post('/users')
        .send({
          user: {
            email: 'test1@example.com',
            username: 'testuser1',
            password: 'password123',
          },
        });

      jwtToken = signupRes1.body.user.token;
      testUsername = signupRes1.body.user.username;

      const signupRes2 = await request(app.getHttpServer())
        .post('/users')
        .send({
          user: {
            email: 'test2@example.com',
            username: 'testuser2',
            password: 'password123',
          },
        });

      otherUserToken = signupRes2.body.user.token;
      otherUsername = signupRes2.body.user.username;
    });

    it('should get profile without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/profiles/${testUsername}`)
        .expect(200);

      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.username).toBe(testUsername);
      expect(response.body.profile.following).toBe(false);
    });

    it('should get profile with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/profiles/${testUsername}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.username).toBe(testUsername);
      expect(response.body.profile.following).toBe(false);
    });

    it('should return 404 for non-existent username', async () => {
      await request(app.getHttpServer())
        .get('/api/profiles/nonexistentuser')
        .expect(404);
    });

    it('should return correct profile data structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/profiles/${testUsername}`)
        .expect(200);

      expect(response.body.profile).toHaveProperty('username');
      expect(response.body.profile).toHaveProperty('bio');
      expect(response.body.profile).toHaveProperty('image');
      expect(response.body.profile).toHaveProperty('following');
    });
  });

  describe('POST /api/profiles/:username/follow', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .expect(401);
    });

    it('should follow a user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      expect(response.body.profile.username).toBe(testUsername);
      expect(response.body.profile.following).toBe(true);
    });

    it('should not create duplicate follow', async () => {
      // First follow
      await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      // Second follow should still return following: true
      const response = await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      expect(response.body.profile.following).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/profiles/nonexistentuser/follow')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });

    it('should return correct profile data after follow', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      expect(response.body.profile).toHaveProperty('username');
      expect(response.body.profile).toHaveProperty('bio');
      expect(response.body.profile).toHaveProperty('image');
      expect(response.body.profile.following).toBe(true);
    });
  });

  describe('DELETE /api/profiles/:username/follow', () => {
    beforeAll(async () => {
      // Follow user before testing unfollow
      await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/profiles/${testUsername}/follow`)
        .expect(401);
    });

    it('should unfollow a user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.username).toBe(testUsername);
      expect(response.body.profile.following).toBe(false);
    });

    it('should handle unfollowing when not following', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.following).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/api/profiles/nonexistentuser/follow')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });

    it('should return correct profile data after unfollow', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile).toHaveProperty('username');
      expect(response.body.profile).toHaveProperty('bio');
      expect(response.body.profile).toHaveProperty('image');
      expect(response.body.profile.following).toBe(false);
    });
  });

  describe('Follow/Unfollow flow', () => {
    it('should follow and unfollow user in sequence', async () => {
      // Check initial state - not following
      let response = await request(app.getHttpServer())
        .get(`/api/profiles/${testUsername}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.following).toBe(false);

      // Follow user
      response = await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      expect(response.body.profile.following).toBe(true);

      // Check state - now following
      response = await request(app.getHttpServer())
        .get(`/api/profiles/${testUsername}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.following).toBe(true);

      // Unfollow user
      response = await request(app.getHttpServer())
        .delete(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.following).toBe(false);

      // Check state - no longer following
      response = await request(app.getHttpServer())
        .get(`/api/profiles/${testUsername}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.following).toBe(false);
    });

    it('should track follows independently per user', async () => {
      // testuser1 follows testuser2
      await request(app.getHttpServer())
        .post(`/api/profiles/${otherUsername}/follow`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(201);

      // testuser2 follows testuser1
      await request(app.getHttpServer())
        .post(`/api/profiles/${testUsername}/follow`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      // Check from testuser1's perspective
      let response = await request(app.getHttpServer())
        .get(`/api/profiles/${otherUsername}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.profile.following).toBe(true);

      // Check from testuser2's perspective
      response = await request(app.getHttpServer())
        .get(`/api/profiles/${testUsername}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.profile.following).toBe(true);
    });
  });
});
