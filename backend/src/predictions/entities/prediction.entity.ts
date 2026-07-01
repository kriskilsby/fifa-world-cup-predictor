// backend/src/predictions/entities/prediction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';

@Entity()
export class Prediction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, {
    nullable: true,
  })
  user?: User;

  @ManyToOne(() => Match)
  match!: Match;

  @Column()
  predictedHomeScore!: number;

  @Column()
  predictedAwayScore!: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  pointsAwarded?: number | null;

  @Column({ type: 'float', nullable: true })
  homeWinProbability?: number;

  @Column({ type: 'float', nullable: true })
  awayWinProbability?: number;

  @Column({ type: 'varchar', nullable: true })
  source?: string; // 'model' or 'user'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
