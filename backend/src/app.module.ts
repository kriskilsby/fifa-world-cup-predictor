// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { PredictionsModule } from './predictions/predictions.module';
import { UsersModule } from './users/users.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FootballDataModule } from './football-data/football-data.module';
import { TeamRatingModule } from './team-rating/team-rating.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      autoLoadEntities: true,
      synchronize: true, // dev only
    }),

    TeamsModule,
    MatchesModule,
    CompetitionsModule,
    PredictionsModule,
    UsersModule,
    FootballDataModule,
    TeamRatingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
