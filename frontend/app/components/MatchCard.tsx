// frontend/app/components/MatchCard.tsx
import { Match } from "../types/match";
import { Prediction } from "../types/prediction";

type MatchCardProps = {
  match: Match;
  prediction?: Prediction;
};

export default function MatchCard({
  match,
  prediction,
}: MatchCardProps) {

  function getLiveStatus(match: Match) {
    const now = new Date();
    const kickoff = new Date(match.utcDate);

    if (match.status === "FINISHED") return "FT";
    if (now < kickoff) return "UPCOMING";
    return "LIVE";
  }

  const status = getLiveStatus(match);


  function getStatusColor(status: string) {
    switch (status) {
      case "FT":
        return "bg-slate-600";
      case "LIVE":
        return "bg-green-600";
      case "UPCOMING":
        return "bg-blue-600";
      default:
        return "bg-blue-600";
    }
  }

  function getPredictionResult(
    predictionHome: number,
    predictionAway: number,
    actualHome: number,
    actualAway: number
  ) {
    if (
      predictionHome === actualHome &&
      predictionAway === actualAway
    ) {
      return {
        label: "Exact Score",
        colour: "text-green-400",
      };
    }

    const predictedOutcome =
      predictionHome > predictionAway
        ? "HOME"
        : predictionHome < predictionAway
        ? "AWAY"
        : "DRAW";

    const actualOutcome =
      actualHome > actualAway
        ? "HOME"
        : actualHome < actualAway
        ? "AWAY"
        : "DRAW";

    if (predictedOutcome === actualOutcome) {
      return {
        label: "Correct Result",
        colour: "text-yellow-400",
      };
    }

    return {
      label: "Incorrect",
      colour: "text-red-400",
    };
  }

  const actualHome = match.score.fullTime.home;
  const actualAway = match.score.fullTime.away;

  const predictionResult =
    prediction &&
    status === "FT" &&
    actualHome !== null &&
    actualAway !== null
      ? getPredictionResult(
          prediction.predictedHomeScore,
          prediction.predictedAwayScore,
          actualHome,
          actualAway
        )
      : null;

  return (
    <div
      className={`rounded-xl p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 hover:border-blue-500 hover:shadow-xl flex flex-col gap-4 ${
        status === "LIVE"
          ? "bg-slate-900 border border-green-500"
          : "bg-slate-900 border border-slate-800"
      }`}
    >
      <div className="flex justify-between text-lg text-gray-400">
        <span>
          {new Date(match.utcDate).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        <span className="font-medium text-gray-300">
          {match.group?.replace("GROUP_", "Group ")}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
            className="w-8 h-8"
          />
          <span className="font-semibold">
            {match.homeTeam.name}
          </span>
        </div>

        {actualHome !== null && (
          <span className="text-2xl font-bold">
            {actualHome}
          </span>
        )}
      </div>

      <div className="text-center text-gray-400 text-sm">
        {status === "UPCOMING" ? (
          <>
            <div className="text-sm text-gray-500">
              KICK OFF
            </div>

            <div className="text-xl font-bold text-blue-400">
              {new Date(match.utcDate).toLocaleTimeString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </div>
          </>
        ) : (
          <div>
            {status === "LIVE"
              ? "IN PROGRESS"
              : "FULL TIME"}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={match.awayTeam.crest}
            alt={match.awayTeam.name}
            className="w-8 h-8"
          />
          <span className="font-semibold">
            {match.awayTeam.name}
          </span>
        </div>

        {actualAway !== null && (
          <span className="text-2xl font-bold">
            {actualAway}
          </span>
        )}
      </div>

      <div className="flex justify-end items-center gap-2">
        {status === "LIVE" && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}

        <span
          className={`text-xs px-2 py-1 rounded font-bold ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </div>

      {prediction && (
        <div className="mt-3 rounded-lg bg-slate-800 p-3 text-md border border-slate-700 text-center">
          <div className="font-medium">
            Prediction:
            {" "}
            {prediction.predictedHomeScore}
            -
            {prediction.predictedAwayScore}
          </div>

          <div>
            Home Win:
            {" "}
            {(prediction.homeWinProbability * 100).toFixed(0)}%
          </div>

          {predictionResult && (
            <div
              className={`mt-2 font-semibold ${predictionResult.colour}`}
            >
              {predictionResult.label}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 