// backend/scripts/bootstrap-elo.ts
import dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { TeamRating } from '../src/team-rating/entities/team-rating.entity';

// adjust path if needed
import { AppDataSource } from '../src/data-source';

async function run() {
  await AppDataSource.initialize();

  const ratingRepo = AppDataSource.getRepository(TeamRating);

  const K = 32;

  const getOrCreate = async (teamId: number) => {
    let team = await ratingRepo.findOne({ where: { teamId } });

    if (!team) {
      team = ratingRepo.create({
        teamId,
        elo: 1500,
      });
      await ratingRepo.save(team);
    }

    return team;
  };

  const expected = (a: number, b: number) =>
    1 / (1 + Math.pow(10, (b - a) / 400));

  // pull historical matches
  const matches = await AppDataSource.query(`
    SELECT *
    FROM historical_results
    ORDER BY match_date ASC
  `);

  console.log(`Replaying ${matches.length} matches...`);

    for (const match of matches) {

    const isValidTeamId = (id: any) =>
        id !== null &&
        id !== undefined &&
        id !== '' &&
        !Number.isNaN(Number(id));

    if (!isValidTeamId(match.home_id) || !isValidTeamId(match.away_id)) {
        continue;
    }

    const homeId = Number(match.home_id);
    const awayId = Number(match.away_id);

    const home = await getOrCreate(homeId);
    const away = await getOrCreate(awayId);

    let homeResult = 0.5;
    let awayResult = 0.5;

    if (match.home_score > match.away_score) {
        homeResult = 1;
        awayResult = 0;
    } else if (match.away_score > match.home_score) {
        homeResult = 0;
        awayResult = 1;
    }

    const expHome = expected(home.elo, away.elo);
    const expAway = expected(away.elo, home.elo);

    home.elo = Math.round(home.elo + K * (homeResult - expHome));
    away.elo = Math.round(away.elo + K * (awayResult - expAway));

    await ratingRepo.save([home, away]);
    }

  console.log('Elo bootstrap complete');

  await AppDataSource.destroy();
}

run();