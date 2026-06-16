// backend/src/football-data/football-data.controller.ts
import { Controller, Get } from '@nestjs/common';
import { FootballDataService } from './football-data.service';

@Controller('football-data')
export class FootballDataController {
  constructor(private readonly footballDataService: FootballDataService) {}

  @Get('competitions')
  async getCompetitions() {
    return this.footballDataService.getCompetitions();
  }

  @Get('import-competitions')
  async importCompetitions() {
    return this.footballDataService.importCompetitions();
  }

  @Get('wc-matches')
  async getWorldCupMatches() {
    return this.footballDataService.getWorldCupMatches();
  }

  @Get('import-wc-teams')
  async importWorldCupTeams() {
    const data = await this.footballDataService.getWorldCupTeams();
    return this.footballDataService.importWorldCupTeams(data.teams);
  }

  @Get('import-wc-matches')
  async importMatches() {
    const data = await this.footballDataService.getWorldCupMatches();
    return this.footballDataService.importWorldCupMatches(data.matches);
  }
}
