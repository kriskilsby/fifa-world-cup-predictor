// backend/src/matches/matches.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { FootballDataService } from '../football-data/football-data.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly footballDataService: FootballDataService,
  ) {}

  findAll() {
    return this.matchRepository.find({
      relations: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
      },
      order: {
        utcDate: 'ASC',
      },
    });
  }

  findOne(id: number) {
    return this.matchRepository.findOne({
      where: { id },
      relations: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
      },
    });
  }

  async refreshMatches() {
    const teams = await this.footballDataService.getWorldCupTeams();

    await this.footballDataService.importWorldCupTeams(teams.teams);

    const matches = await this.footballDataService.getWorldCupMatches();

    await this.footballDataService.importWorldCupMatches(matches.matches);

    return {
      success: true,
    };
  }
}
