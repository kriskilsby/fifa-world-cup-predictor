// src/football-data/football-data.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompetitionsService } from '../competitions/competitions.service';
import { Competition } from 'src/competitions/entities/competition.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Match } from 'src/matches/entities/match.entity';

type FootballDataTeam = {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  fifaCode?: string;
  crest?: string | null;
};

type FootballDataCompetition = {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem?: string | null;
  area?: {
    name?: string | null;
  };
};

type FootballDataMatchScore = {
  fullTime?: {
    home: number | null;
    away: number | null;
  } | null;
  halfTime?: {
    home: number | null;
    away: number | null;
  } | null;
  winner?: string | null;
};

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group?: string | null;
  matchday?: number | null;
  score?: FootballDataMatchScore | null;
  homeTeam?: FootballDataTeam | null;
  awayTeam?: FootballDataTeam | null;
};

type FootballDataCompetitionsResponse = {
  competitions: FootballDataCompetition[];
};

type FootballDataTeamsResponse = {
  teams: FootballDataTeam[];
};

type FootballDataMatchesResponse = {
  matches: FootballDataMatch[];
};

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

  private async getOrCreateTeam(
    apiTeam: FootballDataTeam,
    competition: Competition,
  ) {
    let team = await this.teamRepository.findOne({
      where: { apiId: apiTeam.id },
    });

    const shortName = apiTeam.shortName ?? '';
    const tla = apiTeam.tla ?? '';
    const fifaCode = apiTeam.fifaCode ?? '';
    const crest = apiTeam.crest ?? '';

    if (!team) {
      const teamData: Partial<Team> = {
        apiId: apiTeam.id,
        name: apiTeam.name,
        shortName,
        tla,
        fifaCode,
        crest,
        competition,
      };

      team = this.teamRepository.create(teamData);
    } else {
      team.name = apiTeam.name;
      team.shortName = shortName;
      team.tla = tla;
      team.fifaCode = fifaCode;
      team.crest = crest;
      team.competition = competition;
    }

    return this.teamRepository.save(team);
  }

  // API from https://www.football-data.org/
  async getCompetitions(): Promise<FootballDataCompetitionsResponse> {
    const response =
      await this.httpService.axiosRef.get<FootballDataCompetitionsResponse>(
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
    const response =
      await this.httpService.axiosRef.get<FootballDataCompetitionsResponse>(
        'https://api.football-data.org/v4/competitions',
        {
          headers: {
            'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
          },
        },
      );

    return this.competitionsService.importFromApi(response.data.competitions);
  }

  // API from https://www.football-data.org/
  async getWorldCupMatches(): Promise<FootballDataMatchesResponse> {
    const response =
      await this.httpService.axiosRef.get<FootballDataMatchesResponse>(
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
  async getWorldCupTeams(): Promise<FootballDataTeamsResponse> {
    const response =
      await this.httpService.axiosRef.get<FootballDataTeamsResponse>(
        'https://api.football-data.org/v4/competitions/WC/teams',
        {
          headers: {
            'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
          },
        },
      );

    return response.data;
  }

  async importWorldCupTeams(teams: FootballDataTeam[]) {
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

      const shortName = team.shortName ?? '';
      const tla = team.tla ?? '';
      const fifaCode = team.fifaCode ?? '';
      const crest = team.crest ?? '';

      if (existing) {
        existing.name = team.name;
        existing.shortName = shortName;
        existing.tla = tla;
        existing.fifaCode = fifaCode;
        existing.crest = crest;
        existing.competition = competition;

        await this.teamRepository.save(existing);
        continue;
      }

      const newTeamData: Partial<Team> = {
        apiId: team.id,
        name: team.name,
        shortName,
        tla,
        fifaCode,
        crest,
        competition,
      };

      const newTeam = this.teamRepository.create(newTeamData);

      await this.teamRepository.save(newTeam);
    }

    return {
      imported: teams.length,
    };
  }

  async importWorldCupMatches(matches: FootballDataMatch[]) {
    const competition = await this.competitionRepository.findOne({
      where: { code: 'WC' },
    });

    if (!competition) {
      throw new Error('World Cup competition not found');
    }

    for (const match of matches) {
      const homeTeamData = match.homeTeam;
      const awayTeamData = match.awayTeam;

      if (!homeTeamData?.id || !awayTeamData?.id) {
        console.log(`Skipping match ${match.id} - missing team data`);
        continue;
      }

      const existing = await this.matchRepository.findOne({
        where: { apiId: match.id },
      });

      if (existing) {
        existing.utcDate = new Date(match.utcDate);
        existing.status = match.status;
        existing.stage = match.stage;
        existing.group = match.group ?? '';
        existing.matchday = match.matchday ?? 0;

        existing.score = match.score;

        await this.matchRepository.save(existing);
        continue;
      }

      const homeTeam = await this.getOrCreateTeam(homeTeamData, competition);
      const awayTeam = await this.getOrCreateTeam(awayTeamData, competition);

      const newMatchData: Partial<Match> = {
        apiId: match.id,
        utcDate: new Date(match.utcDate),
        status: match.status,
        stage: match.stage,
        group: match.group ?? '',
        matchday: match.matchday ?? 0,
        score: match.score,
        competition,
        homeTeam,
        awayTeam,
      };

      const newMatch = this.matchRepository.create(newMatchData);

      await this.matchRepository.save(newMatch);
    }

    return {
      imported: matches.length,
    };
  }
}
