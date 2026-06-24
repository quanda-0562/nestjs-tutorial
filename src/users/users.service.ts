import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { t } from '../common/utils/i18n.utils';
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

  async login(email: string, password: string): Promise<{ user: UserDto }> {
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
}


