// backend/src/matches/matches.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './entities/match.entity';

import { FootballDataModule } from '../football-data/football-data.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), FootballDataModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
