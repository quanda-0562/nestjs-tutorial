import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { t } from '../common/utils/i18n.utils';
import { User } from './entities/user.entity';
import { UserDto, CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

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

  async create(createUserDto: CreateUserDto): Promise<{ user: UserDto }> {
    // Validate input
    if (!createUserDto.email || !createUserDto.username || !createUserDto.password) {
      throw new BadRequestException(t('auth.emailAndPasswordRequired'));
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(t('auth.emailAlreadyExists'));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.usersRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: savedUser.id,
      email: savedUser.email,
    });

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        token,
      },
    };
  }

  async getCurrentUser(userId: number): Promise<{ user: UserDto }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(t('auth.userNotFound') || 'User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    };
  }

  async update(userId: number, updateUserDto: any): Promise<{ user: UserDto }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(t('auth.userNotFound') || 'User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(t('auth.emailAlreadyExists'));
      }
      user.email = updateUserDto.email;
    }

    // Update other fields
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }
    if (updateUserDto.bio !== undefined) {
      user.bio = updateUserDto.bio;
    }
    if (updateUserDto.image !== undefined) {
      user.image = updateUserDto.image;
    }
    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersRepository.save(user);

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        image: updatedUser.image,
      },
    };
  }
}
