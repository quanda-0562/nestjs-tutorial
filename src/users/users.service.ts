import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  // In-memory storage for users (replace with database in production)
  private users: Map<string, User> = new Map();
  private userIdCounter = 1;

  constructor(private jwtService: JwtService) {
    // Initialize with a test user (password must be at least 8 characters)
    this.initializeTestUser();
  }

  private initializeTestUser(): void {
    const passwordHash = bcrypt.hashSync('jakejake12', 10);
    const user: User = {
      id: this.userIdCounter++,
      email: 'jake@jake.jake',
      username: 'Jake',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set('jake@jake.jake', user);
  }

  private async createUser(email: string, password: string, username?: string): Promise<User> {
    const existingUser = this.users.get(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: this.userIdCounter++,
      email,
      username,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(email, user);
    return user;
  }

  async login(email: string, password: string): Promise<{ user: UserDto }> {
    // Validate input
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Find user by email
    const user = this.users.get(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
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
    for (const user of this.users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }
}

