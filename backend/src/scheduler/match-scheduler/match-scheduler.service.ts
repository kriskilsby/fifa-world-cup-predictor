// backend/src/scheduler/match-scheduler/match-scheduler.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MatchesService } from '../../matches/matches.service';

@Injectable()
export class MatchSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(MatchSchedulerService.name);

  constructor(private readonly matchesService: MatchesService) {}

  async onModuleInit() {
    this.logger.log('🚀 Running startup match refresh');

    try {
      await this.matchesService.refreshMatches();

      this.logger.log('✅ Startup refresh completed');
    } catch (err) {
      this.logger.error('❌ Startup refresh failed', err);
    }
  }
  /**
   * Every hour: full sync of matches + predictions
   */
  @Cron('0 * * * *') // every hour
  async handleHourlyRefresh() {
    this.logger.log('🔄 Hourly match refresh started');

    try {
      await this.matchesService.refreshMatches();

      this.logger.log('✅ Hourly match refresh completed');
    } catch (err) {
      this.logger.error('❌ Hourly refresh failed', err);
    }
  }
}
