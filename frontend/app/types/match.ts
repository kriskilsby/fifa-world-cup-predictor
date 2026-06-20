// frontend/app/types/match.ts
export type Team = {
  name: string;
  crest: string;
  tla?: string;
};

export type Match = {
  id: number;
  utcDate: string;
  group: string;
  status: string;

  homeTeam: Team;
  awayTeam: Team;

  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
};