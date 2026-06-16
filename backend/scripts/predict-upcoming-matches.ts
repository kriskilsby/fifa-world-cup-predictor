// backend/scripts/predict-upcoming-matches.ts
import 'dotenv/config';
import { AppDataSource } from '../src/data-source';
import { Prediction } from '../src/predictions/entities/prediction.entity';

function expected(a: number, b: number) {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

function predictScore(homeWinProbability: number) {
  if (homeWinProbability >= 0.75) return { homeGoals: 3, awayGoals: 0 };
  if (homeWinProbability >= 0.65) return { homeGoals: 2, awayGoals: 0 };
  if (homeWinProbability >= 0.55) return { homeGoals: 2, awayGoals: 1 };
  if (homeWinProbability >= 0.45) return { homeGoals: 1, awayGoals: 1 };
  if (homeWinProbability >= 0.35) return { homeGoals: 1, awayGoals: 2 };
  if (homeWinProbability >= 0.25) return { homeGoals: 0, awayGoals: 2 };
  return { homeGoals: 0, awayGoals: 3 };
}

async function run() {
  await AppDataSource.initialize();

  const predictionRepo = AppDataSource.getRepository(Prediction);

  // -----------------------------------
  // 1. Get fixtures
  // -----------------------------------
  const fixtures = await AppDataSource.query(`
    SELECT
      m.id,
      m."utcDate",
      ht.id AS home_id,
      ht.name AS home_team,
      at.id AS away_id,
      at.name AS away_team
    FROM match m
    JOIN team ht ON ht.id = m."homeTeamId"
    JOIN team at ON at.id = m."awayTeamId"
    ORDER BY m."utcDate"
  `);

  console.log(`Found ${fixtures.length} fixtures\n`);

  // -----------------------------------
  // 2. Load existing model predictions ONCE (important optimisation)
  // -----------------------------------
  const existingRows = await AppDataSource.query(`
    SELECT "matchId"
    FROM prediction
    WHERE source = 'model'
  `);

  const existingMatchIds = new Set(
    existingRows.map((r: any) => r.matchId)
  );

  console.log(
    `Found ${existingMatchIds.size} existing model predictions`
  );

  // -----------------------------------
  // 3. Loop fixtures
  // -----------------------------------
  for (const match of fixtures) {
    if (existingMatchIds.has(match.id)) {
      console.log(`Skipping ${match.home_team} vs ${match.away_team}`);
      continue;
    }

    // -----------------------------------
    // 4. Get Elo ratings
    // -----------------------------------
    const homeRating = await AppDataSource.query(
      `
      SELECT elo
      FROM team_rating
      WHERE "teamId" = $1
      `,
      [match.home_id],
    );

    const awayRating = await AppDataSource.query(
      `
      SELECT elo
      FROM team_rating
      WHERE "teamId" = $1
      `,
      [match.away_id]
    );

    if (!homeRating.length || !awayRating.length) {
      console.log(`Skipping ${match.home_team} vs ${match.away_team} (missing rating)`);
      continue;
    }

    const homeElo = Number(homeRating[0].elo);
    const awayElo = Number(awayRating[0].elo);

    // -----------------------------------
    // 5. Probability + score prediction
    // -----------------------------------
    const homeWinProbability = expected(homeElo, awayElo);
    const awayWinProbability = expected(awayElo, homeElo);

    const score = predictScore(homeWinProbability);

    // -----------------------------------
    // 6. Save prediction
    // -----------------------------------
    const prediction = predictionRepo.create({
      match: { id: match.id } as any,
      predictedHomeScore: score.homeGoals,
      predictedAwayScore: score.awayGoals,
      homeWinProbability,
      awayWinProbability,
      pointsAwarded: null,
      user: null as any,
      source: 'model',
    });

    await predictionRepo.save(prediction);

    // -----------------------------------
    // 7. Logging
    // -----------------------------------
    console.log(`${match.home_team} vs ${match.away_team}`);
    console.log(`Prediction: ${score.homeGoals}-${score.awayGoals}`);
    console.log(
      `Win Chances: ${(homeWinProbability * 100).toFixed(1)}% vs ${(awayWinProbability * 100).toFixed(1)}%`
    );
    console.log('--------------------------------');
  }

  await AppDataSource.destroy();
}

run().catch(console.error);