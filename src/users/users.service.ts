import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { t } from '../common/utils/i18n.utils';
import { User } from './entities/user.entity';
import { UserDto, CreateUserDto, UserResponseDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private buildUserResponse(user: User, token?: string): UserResponseDto {
    const userDto = new UserDto();
    userDto.id = user.id;
    userDto.email = user.email;
    userDto.username = user.username;
    userDto.bio = user.bio;
    userDto.image = user.image;
    if (token) {
      userDto.token = token;
    }

    const response = new UserResponseDto();
    response.user = userDto;
    return response;
  }

  async login(email: string, password: string): Promise<UserResponseDto> {
    try {
      // Validate input
      if (!email?.trim() || !password?.trim()) {
        throw new BadRequestException(t('auth.emailAndPasswordRequired'));
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Find user by email
      const user = await this.usersRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (!user) {
        this.logger.warn(`Login attempt failed: user not found for email ${normalizedEmail}`);
        throw new UnauthorizedException(t('auth.invalidEmailOrPassword'));
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        this.logger.warn(`Login attempt failed: invalid password for user ${user.id}`);
        throw new UnauthorizedException(t('auth.invalidEmailOrPassword'));
      }

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      this.logger.log(`User logged in successfully: ${user.id}`);
      return this.buildUserResponse(user, token);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Login error: ${error}`);
      throw new BadRequestException(t('auth.loginFailed'));
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Validate input
      if (!createUserDto.email?.trim() || !createUserDto.username?.trim() || !createUserDto.password?.trim()) {
        throw new BadRequestException(t('auth.emailAndPasswordRequired'));
      }

      // Normalize email
      const normalizedEmail = createUserDto.email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        this.logger.warn(`Registration attempt failed: email already exists ${normalizedEmail}`);
        throw new ConflictException(t('auth.emailAlreadyExists'));
      }

      // Hash password
      const passwordHash = await bcrypt.hash(createUserDto.password, this.BCRYPT_ROUNDS);

      // Create new user
      const user = this.usersRepository.create({
        email: normalizedEmail,
        username: createUserDto.username.trim(),
        passwordHash,
      });

      const savedUser = await this.usersRepository.save(user);

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: savedUser.id,
        email: savedUser.email,
      });

      this.logger.log(`User registered successfully: ${savedUser.id}`);
      return this.buildUserResponse(savedUser, token);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Registration error: ${error}`);
      throw new BadRequestException(t('auth.registrationFailed'));
    }
  }

  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(t('auth.userNotFound'));
      }

      return this.buildUserResponse(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Fetch user error: ${error}`);
      throw new BadRequestException(t('auth.fetchUserFailed'));
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(t('auth.userNotFound'));
      }

      // Check if email is being updated and if it's already taken
      if (updateUserDto.email?.trim()) {
        const normalizedNewEmail = updateUserDto.email.toLowerCase().trim();
        if (normalizedNewEmail !== user.email) {
          const existingUser = await this.usersRepository.findOne({
            where: { email: normalizedNewEmail },
          });
          if (existingUser) {
            throw new ConflictException(t('auth.emailAlreadyExists'));
          }
          user.email = normalizedNewEmail;
        }
      }

      // Update other fields
      if (updateUserDto.username?.trim()) {
        user.username = updateUserDto.username.trim();
      }
      if (updateUserDto.bio !== undefined) {
        user.bio = updateUserDto.bio?.trim() || undefined;
      }
      if (updateUserDto.image !== undefined) {
        user.image = updateUserDto.image?.trim() || undefined;
      }
      if (updateUserDto.password?.trim()) {
        user.passwordHash = await bcrypt.hash(updateUserDto.password, this.BCRYPT_ROUNDS);
      }

      const updatedUser = await this.usersRepository.save(user);

      this.logger.log(`User updated successfully: ${userId}`);
      return this.buildUserResponse(updatedUser);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Update user error: ${error}`);
      throw new BadRequestException(t('auth.updateUserFailed'));
    }
  }
}
