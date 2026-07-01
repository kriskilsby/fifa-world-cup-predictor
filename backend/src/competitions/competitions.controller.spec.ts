import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { CompetitionsController } from './competitions.controller';
import { CompetitionsService } from './competitions.service';

describe('CompetitionsController', () => {
  let controller: CompetitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetitionsController],
      providers: [
        {
          provide: CompetitionsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            importFromApi: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompetitionsController>(CompetitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
