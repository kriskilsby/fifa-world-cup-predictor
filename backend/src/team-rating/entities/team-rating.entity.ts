// backend/src/team-rating/entities/team-rating.entity.ts
import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity()
export class TeamRating {
  @PrimaryColumn()
  teamId: number;

  @Column({ type: 'int', default: 1500 })
  elo: number;

  @UpdateDateColumn()
  updatedAt: Date;
}