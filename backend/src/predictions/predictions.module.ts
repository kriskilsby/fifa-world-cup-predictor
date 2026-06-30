// backend/src/predictions/predictions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Prediction } from './entities/prediction.entity';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { Match } from '../matches/entities/match.entity';
import { TeamRating } from '../team-rating/entities/team-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, Match, TeamRating])],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
