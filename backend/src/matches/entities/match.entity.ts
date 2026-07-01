// src/matches/entities/match.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Competition } from '../../competitions/entities/competition.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  apiId!: number;

  @Column()
  utcDate!: Date;

  @Column()
  status!: string;

  @Column({ nullable: true })
  stage?: string;

  @Column({ nullable: true })
  matchday?: number;

  @ManyToOne(() => Competition, (competition) => competition.matches)
  competition!: Competition;

  @ManyToOne(() => Team, { nullable: true })
  homeTeam?: Team;

  @ManyToOne(() => Team, { nullable: true })
  awayTeam?: Team;

  // recommended flexible approach
  @Column({ type: 'json', nullable: true })
  score?: any;

  @Column({ nullable: true })
  group?: string;
}
