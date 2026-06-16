// src/competitions/entities/competition.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Team } from '../../teams/entities/team.entity';
import { Match } from '../../matches/entities/match.entity';

@Entity()
export class Competition {
  @PrimaryGeneratedColumn()
  id: number;

  // ID from football-data.org API
  @Column({ unique: true })
  apiId: number;

  // e.g. "PL", "WC", "CL"
  @Column({ unique: true, nullable: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  emblem: string;

  @Column({ nullable: true })
  areaName: string;

  @Column({ nullable: true })
  currentSeasonStart: string;

  @Column({ nullable: true })
  currentSeasonEnd: string;

  // RELATIONS (logical only, no DB columns created here)

  @OneToMany(() => Team, (team) => team.competition)
  teams: Team[];

  @OneToMany(() => Match, (match) => match.competition)
  matches: Match[];
}
