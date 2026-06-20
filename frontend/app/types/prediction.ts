// frontend/app/types/prediction.ts
export type Prediction = {
  predictedHomeScore: number;
  predictedAwayScore: number;
  homeWinProbability: number;
  awayWinProbability: number;

  match: {
    id: number;
  };
};