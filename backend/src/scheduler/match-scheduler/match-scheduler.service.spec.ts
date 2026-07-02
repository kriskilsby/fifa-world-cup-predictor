// backend/src/scheduler/match-scheduler/match-scheduler.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MatchSchedulerService } from './match-scheduler.service';

describe('MatchSchedulerService', () => {
  let service: MatchSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchSchedulerService],
    }).compile();

    service = module.get<MatchSchedulerService>(MatchSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
