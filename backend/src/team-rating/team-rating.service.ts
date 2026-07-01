// backend/src/team-rating/team-rating.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRating } from './entities/team-rating.entity';

@Injectable()
export class TeamRatingService {
  constructor(
    @InjectRepository(TeamRating)
    private readonly ratingRepo: Repository<TeamRating>,
  ) {}

  private K = 32;

  async getRating(teamId: number): Promise<TeamRating> {
    let rating = await this.ratingRepo.findOne({ where: { teamId } });

    if (!rating) {
      rating = this.ratingRepo.create({
        teamId,
        elo: 1500,
      });
      await this.ratingRepo.save(rating);
    }

    return rating;
  }

  private expectedScore(rA: number, rB: number) {
    return 1 / (1 + Math.pow(10, (rB - rA) / 400));
  }

  async updateRatings(
    homeId: number,
    awayId: number,
    homeGoals: number,
    awayGoals: number,
  ) {
    const home = await this.getRating(homeId);
    const away = await this.getRating(awayId);

    let homeResult = 0.5;
    let awayResult = 0.5;

    if (homeGoals > awayGoals) {
      homeResult = 1;
      awayResult = 0;
    } else if (awayGoals > homeGoals) {
      homeResult = 0;
      awayResult = 1;
    }

    const expectedHome = this.expectedScore(home.elo, away.elo);
    const expectedAway = 1 - expectedHome;

    home.elo = Math.round(home.elo + this.K * (homeResult - expectedHome));

    away.elo = Math.round(away.elo + this.K * (awayResult - expectedAway));

    await this.ratingRepo.save([home, away]);
  }

  async predictMatch(homeId: number, awayId: number) {
    const home = await this.getRating(homeId);
    const away = await this.getRating(awayId);

    const homeProb = this.expectedScore(home.elo, away.elo);

    return {
      homeWinProbability: homeProb,
      awayWinProbability: 1 - homeProb,
      expectedWinner: homeProb > 0.5 ? homeId : awayId,
    };
  }
}
