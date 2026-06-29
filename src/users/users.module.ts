import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserController } from './user.controller';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { AuthModule } from '../common/modules/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  providers: [UsersService, ProfilesService],
  controllers: [UsersController, UserController, ProfilesController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
