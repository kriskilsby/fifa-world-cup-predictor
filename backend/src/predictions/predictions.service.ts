// backend/src/predictions/predictions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Prediction } from './entities/prediction.entity';
import { Match } from '../matches/entities/match.entity';
import { TeamRating } from '../team-rating/entities/team-rating.entity';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,

    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,

    @InjectRepository(TeamRating)
    private readonly teamRatingRepository: Repository<TeamRating>,
  ) {}

  findModelPredictions() {
    return this.predictionRepository.find({
      where: {
        source: 'model',
      },
      relations: {
        match: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    });
  }

  async createMissingModelPredictions() {
    const matches = await this.matchRepository.find({
      relations: {
        homeTeam: true,
        awayTeam: true,
      },
      order: {
        utcDate: 'ASC',
      },
    });

    const existingPredictions = await this.predictionRepository.find({
      where: {
        source: 'model',
      },
      relations: {
        match: true,
      },
    });

    const existingMatchIds = new Set(
      existingPredictions.map((prediction) => prediction.match.id),
    );

    let created = 0;
    let skippedExisting = 0;
    let skippedMissingRating = 0;
    let skippedMissingTeams = 0;

    for (const match of matches) {
      if (existingMatchIds.has(match.id)) {
        skippedExisting++;
        continue;
      }

      if (!match.homeTeam || !match.awayTeam) {
        skippedMissingTeams++;
        continue;
      }

      const [homeRating, awayRating] = await Promise.all([
        this.teamRatingRepository.findOne({
          where: { teamId: match.homeTeam.id },
        }),
        this.teamRatingRepository.findOne({
          where: { teamId: match.awayTeam.id },
        }),
      ]);

      if (!homeRating || !awayRating) {
        skippedMissingRating++;
        continue;
      }

      const homeWinProbability = this.expected(
        homeRating.elo,
        awayRating.elo,
      );
      const awayWinProbability = this.expected(
        awayRating.elo,
        homeRating.elo,
      );
      const score = this.predictScore(homeWinProbability);

      const prediction = this.predictionRepository.create({
        match,
        predictedHomeScore: score.homeGoals,
        predictedAwayScore: score.awayGoals,
        homeWinProbability,
        awayWinProbability,
        pointsAwarded: null,
        source: 'model',
      });

      await this.predictionRepository.save(prediction);
      existingMatchIds.add(match.id);
      created++;
    }

    return {
      created,
      skippedExisting,
      skippedMissingRating,
      skippedMissingTeams,
    };
  }

  private expected(a: number, b: number) {
    return 1 / (1 + Math.pow(10, (b - a) / 400));
  }

  private predictScore(homeWinProbability: number) {
    if (homeWinProbability >= 0.75) return { homeGoals: 3, awayGoals: 0 };
    if (homeWinProbability >= 0.65) return { homeGoals: 2, awayGoals: 0 };
    if (homeWinProbability >= 0.55) return { homeGoals: 2, awayGoals: 1 };
    if (homeWinProbability >= 0.45) return { homeGoals: 1, awayGoals: 1 };
    if (homeWinProbability >= 0.35) return { homeGoals: 1, awayGoals: 2 };
    if (homeWinProbability >= 0.25) return { homeGoals: 0, awayGoals: 2 };

    return { homeGoals: 0, awayGoals: 3 };
  }
}
