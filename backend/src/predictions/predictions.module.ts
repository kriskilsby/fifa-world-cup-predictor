// backend/src/predictions/predictions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Prediction } from './entities/prediction.entity';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction])],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
