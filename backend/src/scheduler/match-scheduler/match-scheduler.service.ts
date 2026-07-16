// backend/src/scheduler/match-scheduler/match-scheduler.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MatchesService } from '../../matches/matches.service';

@Injectable()
export class MatchSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(MatchSchedulerService.name);
  private followUpTimer: NodeJS.Timeout | null = null;
  private tournamentComplete = false;

  constructor(private readonly matchesService: MatchesService) {}

  async onModuleInit() {
    this.logger.log('🚀 Running startup match refresh');

    await this.runRefresh('startup');
  }

  /**
   * Every hour: full sync of matches + predictions
   */
  @Cron('0 * * * *') // every hour
  async handleHourlyRefresh() {
    await this.runRefresh('hourly');
  }

  private async runRefresh(source: 'startup' | 'hourly' | 'follow-up') {
    if (this.tournamentComplete) {
      this.logger.log('🏆 Tournament complete. Stopping scheduler.');
      this.clearFollowUpRefresh();
      return;
    }

    this.logger.log(`🔄 ${source} match refresh started`);

    try {
      await this.matchesService.refreshMatches();

      const matches = await this.matchesService.findAll();
      // const allMatchesFinished =
      //   matches.length > 0 &&
      //   matches.every((match) => match.status === 'FINISHED');

      // if (allMatchesFinished) {
      //   this.tournamentComplete = true;
      //   this.clearFollowUpRefresh();
      //   this.logger.log('🏆 Tournament complete. Stopping scheduler.');
      //   return;
      // }

      // Make sure it picks up the last matches
      const finalMatch = matches.find((match) => match.stage === 'FINAL');

      const tournamentComplete =
        finalMatch !== undefined && finalMatch.status === 'FINISHED';

      if (tournamentComplete) {
        this.tournamentComplete = true;
        this.clearFollowUpRefresh();
        this.logger.log('🏆 World Cup Final completed. Stopping scheduler.');
        return;
      }

      const now = new Date();

      const shouldRefreshSoon = matches.some((match) => {
        const kickoff = new Date(match.utcDate);
        const windowEnd = new Date(kickoff.getTime() + 3 * 60 * 60 * 1000);
        const isFinished = match.status === 'FINISHED';

        return (
          !isFinished &&
          ['TIMED', 'IN_PLAY', 'PAUSED'].includes(match.status) &&
          now >= kickoff &&
          now <= windowEnd
        );
      });

      if (shouldRefreshSoon) {
        this.scheduleFollowUpRefresh();
      } else {
        this.clearFollowUpRefresh();
        this.logger.log(
          'No matches in the kickoff refresh window; keeping the hourly schedule',
        );
      }

      this.logger.log(`✅ ${source} match refresh completed`);
    } catch (err) {
      this.logger.error(`❌ ${source} refresh failed`, err);
    }
  }

  private scheduleFollowUpRefresh() {
    this.clearFollowUpRefresh();

    this.logger.log(
      '⏰ Match in kickoff window; scheduling next refresh in 5 minutes',
    );

    this.followUpTimer = setTimeout(() => {
        void this.runRefresh('follow-up');
      },
      5 * 60 * 1000,
    );
  }

  private clearFollowUpRefresh() {
    if (this.followUpTimer) {
      clearTimeout(this.followUpTimer);
      this.followUpTimer = null;
    }
  }
}
