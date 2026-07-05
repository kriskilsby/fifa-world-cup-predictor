// frontend/app/components/MatchCard.tsx
/* eslint-disable @next/next/no-img-element */

import { Match } from "../types/match";
import { Prediction } from "../types/prediction";
import Badge from "./ui/Badge";

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
      className={`group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-2xl border p-4 shadow-lg transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-2xl motion-reduce:transition-none sm:p-5 ${
        status === "LIVE"
          ? "border-green-500/70 bg-slate-900"
          : "border-slate-800 bg-slate-900"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3 text-sm text-slate-400 sm:gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
            Match
          </div>

          <span className="font-medium text-slate-300">
            {new Date(match.utcDate).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {match.group && (
          <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            {match.group.replace("GROUP_", "Group ")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 py-2 sm:gap-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <img
              src={match.homeTeam.crest}
              alt={match.homeTeam.name}
              className="h-9 w-9 shrink-0 rounded-full bg-white/5 object-contain p-0.5 ring-1 ring-white/10 sm:h-10 sm:w-10"
            />

            <span className="truncate text-sm font-semibold text-slate-100 sm:text-base lg:text-lg">
              {match.homeTeam.name}
            </span>
          </div>

          {actualHome !== null && (
            <span className="min-w-[2.5rem] text-right text-2xl font-semibold tracking-tight tabular-nums text-slate-50 sm:min-w-[3rem] sm:text-3xl lg:text-4xl">
              {actualHome}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2.5 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500 sm:gap-3 sm:text-xs">
          <span className="h-px flex-1 bg-slate-800/80" />

          {status === "UPCOMING" ? (
            <span>Kick off</span>
          ) : status === "LIVE" ? (
            <span>In progress</span>
          ) : (
            <span>Full time</span>
          )}

          <span className="h-px flex-1 bg-slate-800/80" />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <img
              src={match.awayTeam.crest}
              alt={match.awayTeam.name}
              className="h-9 w-9 shrink-0 rounded-full bg-white/5 object-contain p-0.5 ring-1 ring-white/10 sm:h-10 sm:w-10"
            />

            <span className="truncate text-sm font-semibold text-slate-100 sm:text-base lg:text-lg">
              {match.awayTeam.name}
            </span>
          </div>

          {actualAway !== null && (
            <span className="min-w-[2.5rem] text-right text-2xl font-semibold tracking-tight tabular-nums text-slate-50 sm:min-w-[3rem] sm:text-3xl lg:text-4xl">
              {actualAway}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-sm text-slate-400 sm:pt-4">
        {status === "UPCOMING" ? (
          <>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Kick off
            </div>

            <div className="text-base font-semibold text-sky-400 tabular-nums">
              {new Date(match.utcDate).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </>
        ) : (
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {status === "LIVE" ? "In progress" : "Full time"}
          </div>
        )}

        {status === "LIVE" && (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400/80 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
        )}

        <Badge className={`px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </div>

      {prediction && (
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 sm:mt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Prediction
              </div>

              <div className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-slate-100 sm:text-2xl">
                {prediction.predictedHomeScore}
                -
                {prediction.predictedAwayScore}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                H win
              </div>

              <div className="mt-1 text-base font-semibold tabular-nums text-sky-400 sm:text-lg">
                {(prediction.homeWinProbability * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
              <span>Conf.</span>
              <span>H edge</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400"
                style={{ width: `${Math.max(0, Math.min(100, prediction.homeWinProbability * 100))}%` }}
              />
            </div>
          </div>

          {predictionResult && (
            <div className="mt-2.5 flex justify-start">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${predictionResult.colour} border-current/20 bg-slate-900/80`}
              >
                {predictionResult.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 