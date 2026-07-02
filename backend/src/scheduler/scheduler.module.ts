// backend/src/scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { MatchSchedulerService } from './match-scheduler/match-scheduler.service';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [MatchesModule],
  providers: [MatchSchedulerService],
})
export class SchedulerModule {}
