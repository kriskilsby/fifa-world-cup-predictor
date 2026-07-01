import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { CompetitionsService } from '../competitions/competitions.service';
import { Competition } from '../competitions/entities/competition.entity';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';
import { FootballDataService } from './football-data.service';

describe('FootballDataService', () => {
  let service: FootballDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FootballDataService,
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(),
            },
          },
        },
        {
          provide: CompetitionsService,
          useValue: {
            importFromApi: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Match),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Team),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Competition),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FootballDataService>(FootballDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
