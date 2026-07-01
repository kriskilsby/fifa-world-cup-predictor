// backend/src/team-rating/team-rating.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamRating } from './entities/team-rating.entity';
import { TeamRatingService } from './team-rating.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamRating])],
  providers: [TeamRatingService],
  exports: [TeamRatingService],
})
export class TeamRatingModule {}
