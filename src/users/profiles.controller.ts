import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import type { OptionalAuthenticatedRequest, AuthenticatedRequest } from '../common/types/request.types';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto } from './dto/profile.dto';

@ApiTags('profiles')
@Controller('api/profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  /**
   * Retrieves a user profile with optional authentication for follow status
   * @param username - Username to retrieve
   * @param req - Request object (optional user context)
   */
  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiParam({
    name: 'username',
    description: 'The username of the profile to retrieve',
    example: 'jake',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async getProfile(
    @Param('username') username: string,
    @Request() req: OptionalAuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    const currentUserId = req.user?.userId;
    return this.profilesService.getProfile(username, currentUserId);
  }

  /**
   * Follows a user (requires authentication)
   * @param username - Username to follow
   * @param req - Authenticated request object
   */
  @Post(':username/follow')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'username',
    description: 'The username of the profile to follow',
    example: 'jake',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully followed the profile',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot follow self or validation error',
  })
  async followUser(
    @Param('username') username: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.followUser(username, req.user!.userId);
  }

  /**
   * Unfollows a user (requires authentication)
   * @param username - Username to unfollow
   * @param req - Authenticated request object
   */
  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'username',
    description: 'The username of the profile to unfollow',
    example: 'jake',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully unfollowed the profile',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async unfollowUser(
    @Param('username') username: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.unfollowUser(username, req.user!.userId);
  }
}
