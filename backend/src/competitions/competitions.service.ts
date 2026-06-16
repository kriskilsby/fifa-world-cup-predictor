// src/competitions/competitions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Competition } from './entities/competition.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private competitionRepository: Repository<Competition>,
  ) {}

  // -----------------------------------
  // BASIC CRUD (you can keep or extend later)
  // -----------------------------------

  create(dto: CreateCompetitionDto) {
    const competition = this.competitionRepository.create(dto);
    return this.competitionRepository.save(competition);
  }

  findAll() {
    return this.competitionRepository.find({
      relations: {
        teams: true,
        matches: true,
      },
    });
  }

  findOne(id: number) {
    return this.competitionRepository.findOne({
      where: { id },
      relations: {
        teams: true,
        matches: true,
      },
    });
  }

  update(id: number, dto: UpdateCompetitionDto) {
    return this.competitionRepository.update(id, dto);
  }

  remove(id: number) {
    return this.competitionRepository.delete(id);
  }

  // -----------------------------------
  // IMPORT LOGIC (THIS is what you were adding)
  // -----------------------------------

  async importFromApi(competitions: any[]) {
    for (const comp of competitions) {
      const existing = await this.competitionRepository.findOne({
        where: { apiId: comp.id },
      });

      // if (existing) continue;
      if (existing) {
        existing.name = comp.name;
        existing.code = comp.code;
        existing.type = comp.type;
        existing.emblem = comp.emblem;
        existing.areaName = comp.area?.name;

        await this.competitionRepository.save(existing);
        continue;
      }

      const competition = this.competitionRepository.create({
        apiId: comp.id,
        name: comp.name,
        code: comp.code,
        type: comp.type,
        emblem: comp.emblem,
        areaName: comp.area?.name,
      });

      await this.competitionRepository.save(competition);
    }

    return { imported: competitions.length };
  }
}
