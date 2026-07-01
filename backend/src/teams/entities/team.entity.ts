// src/teams/entities/team.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Competition } from '../../competitions/entities/competition.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  apiId!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  shortName?: string;

  @Column({ nullable: true })
  tla?: string;

  @Column({ nullable: true })
  fifaCode?: string;

  @Column({ nullable: true })
  crest?: string;

  @Column({ nullable: true })
  groupName?: string;

  @ManyToOne(() => Competition, (competition) => competition.teams)
  competition!: Competition;
}
