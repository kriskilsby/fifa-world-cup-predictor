import { Controller, Get, Param } from '@nestjs/common';
import { TeamRatingService } from './team-rating.service';

@Controller('team-rating')
export class TeamRatingController {
  constructor(private readonly teamRatingService: TeamRatingService) {}

  @Get(':homeId/:awayId')
  predict(@Param('homeId') homeId: string, @Param('awayId') awayId: string) {
    return this.teamRatingService.predictMatch(+homeId, +awayId);
  }
}