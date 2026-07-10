import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './entities/article.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../common/modules/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Comment, User]), AuthModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
