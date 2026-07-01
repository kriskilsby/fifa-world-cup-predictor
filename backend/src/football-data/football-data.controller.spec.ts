import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { FootballDataController } from './football-data.controller';
import { FootballDataService } from './football-data.service';

describe('FootballDataController', () => {
  let controller: FootballDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FootballDataController],
      providers: [
        {
          provide: FootballDataService,
          useValue: {
            getCompetitions: jest.fn(),
            importCompetitions: jest.fn(),
            getWorldCupMatches: jest.fn(),
            getWorldCupTeams: jest.fn(),
            importWorldCupTeams: jest.fn(),
            importWorldCupMatches: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FootballDataController>(FootballDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
