// src/football-data/football-data.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompetitionsService } from '../competitions/competitions.service';
import { Competition } from 'src/competitions/entities/competition.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Match } from 'src/matches/entities/match.entity';

@Injectable()
export class FootballDataService {
  constructor(
    private readonly httpService: HttpService,
    private readonly competitionsService: CompetitionsService,

    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,

    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
  ) {}

  private async getOrCreateTeam(apiTeam: any, competition: Competition) {
    let team = await this.teamRepository.findOne({
      where: { apiId: apiTeam.id },
    });

    if (!team) {
      team = this.teamRepository.create({
        apiId: apiTeam.id,
        name: apiTeam.name,
        shortName: apiTeam.shortName,
        tla: apiTeam.tla,
        fifaCode: apiTeam.fifaCode,
        crest: apiTeam.crest,
        competition,
      });
    } else {
      team.name = apiTeam.name;
      team.shortName = apiTeam.shortName;
      team.tla = apiTeam.tla;
      team.fifaCode = apiTeam.fifaCode;
      team.crest = apiTeam.crest;
      team.competition = competition;
    }

    return this.teamRepository.save(team);
  }

  // API from https://www.football-data.org/
  async getCompetitions() {
    const response = await this.httpService.axiosRef.get(
      'https://api.football-data.org/v4/competitions',
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
        },
      },
    );

    return response.data;
  }

  // API from https://www.football-data.org/
  async importCompetitions() {
    const response = await this.httpService.axiosRef.get(
      'https://api.football-data.org/v4/competitions',
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
        },
      },
    );

    return this.competitionsService.importFromApi(
      response.data.competitions,
    );
  }

  // API from https://www.football-data.org/
  async getWorldCupMatches() {
    const response = await this.httpService.axiosRef.get(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
        },
      },
    );

    return response.data;
  }

  // API from https://www.football-data.org/
  async getWorldCupTeams() {
    const response = await this.httpService.axiosRef.get(
      'https://api.football-data.org/v4/competitions/WC/teams',
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
        },
      },
    );

    return response.data;
  }

  async importWorldCupTeams(teams: any[]) {
    const competition = await this.competitionRepository.findOne({
      where: { code: 'WC' },
    });

    if (!competition) {
      throw new Error('World Cup competition not found in DB');
    }

    for (const team of teams) {
      const existing = await this.teamRepository.findOne({
        where: { apiId: team.id },
      });

      if (existing) {
        existing.name = team.name;
        existing.shortName = team.shortName;
        existing.tla = team.tla;
        existing.fifaCode = team.fifaCode;
        existing.crest = team.crest;
        existing.competition = competition;

        await this.teamRepository.save(existing);
        continue;
      }

      const newTeam = this.teamRepository.create({
        apiId: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        fifaCode: team.fifaCode,
        crest: team.crest,

        competition: competition,
      });

      await this.teamRepository.save(newTeam);
    }

    return {
      imported: teams.length,
    };
  }

  async importWorldCupMatches(matches: any[]) {
    const competition = await this.competitionRepository.findOne({
        where: { code: 'WC' },
    });

    if (!competition) {
      throw new Error('World Cup competition not found');
    }

    for (const match of matches) {
      // 🧠 SAFETY CHECK FIRST
      if (!match.homeTeam?.id || !match.awayTeam?.id) {
        console.log(`Skipping match ${match.id} - missing team data`);
        continue;
      }

      const existing = await this.matchRepository.findOne({
        where: { apiId: match.id },
      });

      if (existing) {
        existing.utcDate = match.utcDate;
        existing.status = match.status;
        existing.stage = match.stage;
        existing.group = match.group;
        existing.matchday = match.matchday;

        existing.score = match.score;

        await this.matchRepository.save(existing);
        continue;
      }

      // const homeTeam = await this.teamRepository.findOne({
      //   where: { apiId: match.homeTeam.id },
      // });

      // const awayTeam = await this.teamRepository.findOne({
      //   where: { apiId: match.awayTeam.id },
      // });

      // if (!homeTeam || !awayTeam) {
      //   console.log(`Skipping match ${match.id} - teams not found in DB`);
      //   continue;
      // }

      const homeTeam = await this.getOrCreateTeam(match.homeTeam, competition);
      const awayTeam = await this.getOrCreateTeam(match.awayTeam, competition);

      const newMatch = this.matchRepository.create({
        apiId: match.id,
        utcDate: match.utcDate,
        status: match.status,
        stage: match.stage,
        group: match.group,
        matchday: match.matchday,

        score: match.score,

        competition,
        homeTeam,
        awayTeam,
      });

      await this.matchRepository.save(newMatch);
    }

    return {
      imported: matches.length,
    };
  }
}
