import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { t } from '../common/utils/i18n.utils';
import { User } from './entities/user.entity';
import { ProfileDto, ProfileResponseDto } from './dto/profile.dto';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Validates and normalizes username input
   * @throws BadRequestException if username is empty
   */
  private validateUsername(username?: string): string {
    const trimmedUsername = username?.trim();
    if (!trimmedUsername) {
      throw new BadRequestException(t('profile.usernameRequired'));
    }
    return trimmedUsername;
  }

  /**
   * Builds a profile response DTO from user entity
   */
  private buildProfileResponse(
    user: User,
    following: boolean,
  ): ProfileResponseDto {
    const profileDto = new ProfileDto();
    profileDto.username = user.username;
    profileDto.bio = user.bio;
    profileDto.image = user.image;
    profileDto.following = following;

    const response = new ProfileResponseDto();
    response.profile = profileDto;
    return response;
  }

  /**
   * Retrieves a user profile with follow status
   * @param username - Username of the profile to retrieve
   * @param currentUserId - Current user ID (optional, for checking follow status)
   */
  async getProfile(
    username: string,
    currentUserId?: number,
  ): Promise<ProfileResponseDto> {
    try {
      // Validate input
      const validatedUsername = this.validateUsername(username);

      // Find user by username
      const user = await this.usersRepository.findOne({
        where: { username: validatedUsername },
      });

      if (!user) {
        this.logger.warn(`Profile not found for username: ${validatedUsername}`);
        throw new NotFoundException(t('profile.notFound'));
      }

      // Check if current user is following this profile
      const isFollowing = currentUserId
        ? await this.isUserFollowing(currentUserId, user.id)
        : false;

      this.logger.debug(`Profile retrieved for username: ${validatedUsername}`);
      return this.buildProfileResponse(user, isFollowing);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Get profile error for username ${username}: ${error}`);
      throw new BadRequestException(t('profile.fetchFailed'));
    }
  }

  /**
   * Follows a user
   * @param username - Username of the profile to follow
   * @param currentUserId - Current user ID
   * @throws BadRequestException if trying to follow self
   */
  async followUser(
    username: string,
    currentUserId: number,
  ): Promise<ProfileResponseDto> {
    try {
      // Validate input
      const validatedUsername = this.validateUsername(username);

      // Find user to follow
      const userToFollow = await this.usersRepository.findOne({
        where: { username: validatedUsername },
        relations: ['following'],
      });

      if (!userToFollow) {
        this.logger.warn(
          `Follow attempt failed: profile not found for username ${validatedUsername}`,
        );
        throw new NotFoundException(t('profile.notFound'));
      }

      // Prevent self-following
      if (userToFollow.id === currentUserId) {
        throw new BadRequestException(t('profile.cannotFollowSelf'));
      }

      // Validate current user exists
      const currentUser = await this.usersRepository.findOne({
        where: { id: currentUserId },
        relations: ['following'],
      });

      if (!currentUser) {
        this.logger.warn(
          `Follow attempt failed: current user not found (userId: ${currentUserId})`,
        );
        throw new NotFoundException(t('auth.userNotFound'));
      }

      // Check if already following
      const isAlreadyFollowing = currentUser.following.some(
        (user) => user.id === userToFollow.id,
      );

      if (!isAlreadyFollowing) {
        // Add user to following list using ORM relationship
        currentUser.following.push(userToFollow);
        await this.usersRepository.save(currentUser);
        this.logger.log(
          `User ${currentUserId} followed profile ${userToFollow.id}`,
        );
      }

      return this.buildProfileResponse(userToFollow, true);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Follow user error for username ${username}: ${error}`);
      throw new BadRequestException(t('profile.followFailed'));
    }
  }

  /**
   * Unfollows a user
   * @param username - Username of the profile to unfollow
   * @param currentUserId - Current user ID
   */
  async unfollowUser(
    username: string,
    currentUserId: number,
  ): Promise<ProfileResponseDto> {
    try {
      // Validate input
      const validatedUsername = this.validateUsername(username);

      // Find user to unfollow
      const userToUnfollow = await this.usersRepository.findOne({
        where: { username: validatedUsername },
      });

      if (!userToUnfollow) {
        this.logger.warn(
          `Unfollow attempt failed: profile not found for username ${validatedUsername}`,
        );
        throw new NotFoundException(t('profile.notFound'));
      }

      // Validate current user exists
      const currentUser = await this.usersRepository.findOne({
        where: { id: currentUserId },
        relations: ['following'],
      });

      if (!currentUser) {
        this.logger.warn(
          `Unfollow attempt failed: current user not found (userId: ${currentUserId})`,
        );
        throw new NotFoundException(t('auth.userNotFound'));
      }

      // Remove user from following list using ORM relationship
      const followIndex = currentUser.following.findIndex(
        (user) => user.id === userToUnfollow.id,
      );

      if (followIndex > -1) {
        currentUser.following.splice(followIndex, 1);
        await this.usersRepository.save(currentUser);
        this.logger.log(
          `User ${currentUserId} unfollowed profile ${userToUnfollow.id}`,
        );
      }

      return this.buildProfileResponse(userToUnfollow, false);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Unfollow user error for username ${username}: ${error}`,
      );
      throw new BadRequestException(t('profile.unfollowFailed'));
    }
  }

  /**
   * Checks if a user is following another user
   * @param userId - User ID
   * @param targetUserId - Target user ID
   */
  private async isUserFollowing(
    userId: number,
    targetUserId: number,
  ): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['following'],
      });

      if (!user) {
        return false;
      }

      return user.following.some((followedUser) => followedUser.id === targetUserId);
    } catch (error) {
      this.logger.error(
        `Error checking follow status for userId ${userId} and targetUserId ${targetUserId}: ${error}`,
      );
      return false;
    }
  }
}
