import { Controller, Get, Put, UseGuards, Req, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiBearerAuth, ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto, UpdateUserRequestDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('api/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieve the current authenticated user information. Requires JWT token in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved current user',
    type: UserResponseDto,
    example: {
      user: {
        id: 1,
        email: 'jake@jake.jake',
        username: 'Jake',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized or invalid token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    example: {
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    },
  })
  async getCurrentUser(@Req() req: any): Promise<UserResponseDto> {
    return this.usersService.getCurrentUser(req.user.userId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update authenticated user',
    description: 'Update the profile of the authenticated user. Requires valid JWT token in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: UserResponseDto,
    example: {
      user: {
        id: 1,
        email: 'jake@jake.jake',
        username: 'Jake',
        bio: 'I like to skateboard',
        image: 'https://i.stack.imgur.com/xHWG8.jpg',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    example: {
      statusCode: 400,
      message: 'Invalid request',
      error: 'Bad Request',
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
  @ApiConflictResponse({
    description: 'Email already exists',
    example: {
      statusCode: 409,
      message: 'Email already exists',
      error: 'Conflict',
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    example: {
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    },
  })
  async update(@Req() req: any, @Body() updateUserRequest: UpdateUserRequestDto): Promise<UserResponseDto> {
    return this.usersService.update(req.user.userId, updateUserRequest.user);
  }
}
