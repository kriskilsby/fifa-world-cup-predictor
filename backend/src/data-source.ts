// backend/src/data-source.ts
import { DataSource } from 'typeorm';
import { TeamRating } from './team-rating/entities/team-rating.entity';
import { Match } from './matches/entities/match.entity';
import { Competition } from './competitions/entities/competition.entity';
import { Team } from './teams/entities/team.entity';
import { Prediction } from './predictions/entities/prediction.entity';
import { User } from './users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [TeamRating, Match, Competition, Team, Prediction, User],
  synchronize: false,
});
