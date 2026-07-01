import { Controller, Post, Body, Req, UseGuards, HttpCode, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiConflictResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { LoginRequestDto } from './dto/login.dto';
import { UserResponseDto, CreateUserRequestDto, LogoutResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import type { AuthenticatedRequest } from '../common/types/request.types';

@Controller('api/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns user data with JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: UserResponseDto,
    example: {
      user: {
        id: 1,
        email: 'jake@jake.jake',
        username: 'Jake',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or missing required fields',
    example: {
      statusCode: 400,
      message: 'Email and password are required',
      error: 'Bad Request',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
    example: {
      statusCode: 401,
      message: 'Invalid email or password',
      error: 'Unauthorized',
    },
  })
  async login(
    @Body() loginRequest: LoginRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.login(loginRequest.user.email, loginRequest.user.password);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User logout',
    description: 'Validate the current JWT and revoke it so the same token cannot be used again.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    type: LogoutResponseDto,
    example: {
      message: 'Logout successful. The current token has been invalidated.',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - missing or invalid token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  })
  async logout(@Req() req: AuthenticatedRequest): Promise<LogoutResponseDto> {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.slice('Bearer '.length)
      : undefined;
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Keep compatibility with both the real JWT strategy (`id`) and existing mocks (`userId`).
    const authenticatedUserId = req.user?.userId ?? req.user?.id;
    return this.usersService.logout(authenticatedUserId as number, token);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Register a new user with email, username and password. Returns user data with JWT token.',
  })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserResponseDto,
    example: {
      user: {
        id: 1,
        email: 'jake@jake.jake',
        username: 'Jacob',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or missing required fields',
    example: {
      statusCode: 400,
      message: 'Email, username and password are required',
      error: 'Bad Request',
    },
  })
  @ApiConflictResponse({
    description: 'Email already exists',
    example: {
      statusCode: 409,
      message: 'Email already exists',
      error: 'Conflict',
    },
  })
  async create(
    @Body() createUserRequest: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserRequest.user);
  }
}
