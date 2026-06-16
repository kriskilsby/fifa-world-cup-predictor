import { Test, TestingModule } from '@nestjs/testing';
import { TeamRatingService } from './team-rating.service';

describe('TeamRatingService', () => {
  let service: TeamRatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamRatingService],
    }).compile();

    service = module.get<TeamRatingService>(TeamRatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
