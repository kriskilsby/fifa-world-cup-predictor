// backend/src/predictions/predictions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Prediction } from './entities/prediction.entity';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
  ) {}

  findModelPredictions() {
    return this.predictionRepository.find({
      where: {
        source: 'model',
      },
      relations: {
        match: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    });
  }
}