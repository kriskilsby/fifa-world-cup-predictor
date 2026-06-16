import { Test, TestingModule } from '@nestjs/testing';
import { TeamRatingController } from './team-rating.controller';
import { TeamRatingService } from './team-rating.service';

describe('TeamRatingController', () => {
  let controller: TeamRatingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamRatingController],
      providers: [TeamRatingService],
    }).compile();

    controller = module.get<TeamRatingController>(TeamRatingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
