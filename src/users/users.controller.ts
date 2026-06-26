import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { LoginRequestDto } from './dto/login.dto';
import { UserResponseDto, CreateUserRequestDto } from './dto/user.dto';

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
