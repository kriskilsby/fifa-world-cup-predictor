// backend/src/predictions/predictions.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PredictionsService } from './predictions.service';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('model')
  findModelPredictions() {
    return this.predictionsService.findModelPredictions();
  }
}
