// src/football-data/football-data.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { FootballDataService } from './football-data.service';
import { FootballDataController } from './football-data.controller';

import { Competition } from 'src/competitions/entities/competition.entity';
import { Team } from 'src/teams/entities/team.entity';

import { CompetitionsModule } from 'src/competitions/competitions.module';
import { Match } from 'src/matches/entities/match.entity';

@Module({
  imports: [
    HttpModule,
    CompetitionsModule,

    // 👇 THIS is what creates TeamRepository + CompetitionRepository
    TypeOrmModule.forFeature([Match, Competition, Team]),
  ],

  controllers: [FootballDataController],

  providers: [FootballDataService],

  exports: [FootballDataService],
})
export class FootballDataModule {}
