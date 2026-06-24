import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import i18next from 'i18next';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async initializeTestUser(): Promise<void> {
    try {
      // Check if test user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: 'jake@jake.jake' },
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash('jakejake12', 10);
        const user = this.usersRepository.create({
          email: 'jake@jake.jake',
          username: 'Jake',
          passwordHash,
        });
        await this.usersRepository.save(user);
      }
    } catch (error) {
      // Silently fail if database is not available (e.g., in tests with mocks)
      // This allows tests to use mocked repositories without errors
    }
  }

  async createUser(email: string, password: string, username?: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      username,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async login(email: string, password: string, i18n?: typeof i18next): Promise<{ user: UserDto }> {
    const t = i18n?.t || ((key: string) => key);

    // Validate input
    if (!email || !password) {
      throw new BadRequestException(t('auth.emailAndPasswordRequired'));
    }

    // Find user by email
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(t('auth.invalidEmailOrPassword'));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(t('auth.invalidEmailOrPassword'));
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        token,
      },
    };
  }

  async validateUser(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }
}


