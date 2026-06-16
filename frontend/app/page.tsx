// frontend/app/page.tsx
"use client";

import { match } from "assert/strict";
import { useEffect, useState } from "react";

type Team = {
  name: string;
  crest: string;
  tla?: string;
};

type Match = {
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

type Prediction = {
  predictedHomeScore: number;
  predictedAwayScore: number;
  homeWinProbability: number;
  awayWinProbability: number;
  match: {
    id: number;
  };
};

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  async function fetchMatches() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:3000/matches");

      if (!res.ok) {
        throw new Error(`Failed to fetch matches: ${res.status}`);
      }

      const data = await res.json();
      setMatches(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPredictions() {
    try {
      const res = await fetch(
        "http://localhost:3000/predictions/model"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const data = await res.json();

      setPredictions(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchMatches();
    fetchPredictions();
  }, []);

  async function refreshMatches() {
    try {
      setLoading(true);

      await fetch("http://localhost:3000/matches/refresh", {
        method: "POST",
      });

      await fetchMatches();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "FINISHED":
        return "bg-slate-600";
      case "IN_PLAY":
        return "bg-green-600";
      default:
        return "bg-blue-600";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusText(status: string) {
    switch (status) {
      case "IN_PLAY":
        return "LIVE";
      case "FINISHED":
        return "FT";
      case "TIMED":
        return "UPCOMING";
      default:
        return status;
    }
  }

  function getPredictionResult(
    predictionHome: number,
    predictionAway: number,
    actualHome: number,
    actualAway: number
  ) {
    // Exact score
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

  const groups = Array.from(
    new Set(matches.map((m) => m.group))
  ).filter(Boolean);

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(search.toLowerCase());

    const matchesGroup =
      selectedGroup === "ALL" || match.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  const predictionMap = new Map(
    predictions.map((prediction) => [
      prediction.match.id,
      prediction,
    ])
  );

  let exactScores = 0;
  let correctResults = 0;
  let incorrectResults = 0;

  matches.forEach((match) => {
    if (match.status !== "FINISHED") return;

    const prediction = predictionMap.get(match.id);

    if (!prediction) return;

    const actualHome = match.score.fullTime.home;
    const actualAway = match.score.fullTime.away;

    if (actualHome === null || actualAway === null) return;

    const result = getPredictionResult(
      prediction.predictedHomeScore,
      prediction.predictedAwayScore,
      actualHome,
      actualAway
    );

    if (result.label === "Exact Score") {
      exactScores++;
    } else if (result.label === "Correct Result") {
      correctResults++;
    } else {
      incorrectResults++;
    }
  });

  const finishedPredictions =
    exactScores +
    correctResults +
    incorrectResults;

  const accuracy =
    finishedPredictions > 0
      ? (
          ((exactScores + correctResults) /
            finishedPredictions) *
          100
        ).toFixed(1)
      : "0";

  // Build team statistics
  const teamStatsMap: Record<
    string,
    {
      correct: number;
      total: number;
    }
  > = {};

  matches.forEach((match) => {
    if (match.status !== "FINISHED") return;

    const prediction = predictionMap.get(match.id);

    if (!prediction) return;

    const actualHome = match.score.fullTime.home;
    const actualAway = match.score.fullTime.away;

    if (actualHome === null || actualAway === null) return;

    const predictedOutcome =
      prediction.predictedHomeScore >
      prediction.predictedAwayScore
        ? "HOME"
        : prediction.predictedHomeScore <
          prediction.predictedAwayScore
        ? "AWAY"
        : "DRAW";

    const actualOutcome =
      actualHome > actualAway
        ? "HOME"
        : actualHome < actualAway
        ? "AWAY"
        : "DRAW";

    const correct =
      predictedOutcome === actualOutcome;

    const teams = [
      match.homeTeam.name,
      match.awayTeam.name,
    ];

    teams.forEach((team) => {
      if (!teamStatsMap[team]) {
        teamStatsMap[team] = {
          correct: 0,
          total: 0,
        };
      }

      teamStatsMap[team].total++;

      if (correct) {
        teamStatsMap[team].correct++;
      }
    });
  });


  const teamStats = Object.entries(teamStatsMap)
    .map(([team, stats]) => ({
      team,
      correct: stats.correct,
      total: stats.total,
      accuracy:
        stats.total > 0
          ? (stats.correct / stats.total) * 100
          : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  // Frontend rendering
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          World Cup Matches
        </h1>

        <div className="mb-6 rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h2 className="text-xl font-bold mb-3">
            Model Performance
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-green-400 text-2xl font-bold">
                {exactScores}
              </div>
              <div className="text-sm text-gray-400">
                Exact Scores
              </div>
            </div>

            <div>
              <div className="text-yellow-400 text-2xl font-bold">
                {correctResults}
              </div>
              <div className="text-sm text-gray-400">
                Correct Results
              </div>
            </div>

            <div>
              <div className="text-red-400 text-2xl font-bold">
                {incorrectResults}
              </div>
              <div className="text-sm text-gray-400">
                Incorrect
              </div>
            </div>

            <div>
              <div className="text-blue-400 text-2xl font-bold">
                {accuracy}%
              </div>
              <div className="text-sm text-gray-400">
                Accuracy
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-3">
          Team Prediction Accuracy
        </h2>

        <div className="space-y-2">
          {teamStats.slice(0, 15).map((team) => (
            <div
              key={team.team}
              className="flex justify-between border-b border-slate-800 pb-1"
            >
              <div>
                <div>{team.team}</div>

                <div className="text-xs text-gray-500">
                  {team.correct}/{team.total}
                </div>
              </div>

              <div
                className={
                  team.accuracy >= 70
                    ? "text-green-400"
                    : team.accuracy >= 40
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {team.accuracy.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Match data is updated periodically and may not reflect live scores.
        </p>

        <button
          onClick={refreshMatches}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Match Data
        </button>

        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
        />

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full mb-6 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
        >
          <option value="ALL">All Groups</option>

          {groups.map((group) => (
            <option key={group} value={group}>
              {group.replace("GROUP_", "Group ")}
            </option>
          ))}
        </select>

        {loading && (
          <p className="text-gray-400">Loading matches...</p>
        )}

        {error && (
          <div className="bg-red-900 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => {
            const prediction = predictionMap.get(match.id);
            const actualHome = match.score.fullTime.home;
            const actualAway = match.score.fullTime.away;

            const predictionResult =
              prediction &&
              match.status === "FINISHED" &&
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
              key={match.id}
              className={`rounded-xl p-5 shadow-lg flex flex-col gap-4 ${
                match.status === "IN_PLAY"
                  ? "bg-slate-900 border border-green-500"
                  : "bg-slate-900 border border-slate-800"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatDate(match.utcDate)}</span>
                <span className="font-medium text-gray-300">
                  {match.group?.replace("GROUP_", "Group ")}
                </span>
              </div>

              {/* Home */}
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

                {match.score.fullTime.home !== null && (
                <span className="text-2xl font-bold">
                  {match.score.fullTime.home}
                </span>
              )}
              </div>

              {/* VS / Score center */}
              <div className="text-center text-gray-400 text-sm">
                <div className="text-center">
                  {match.status === "TIMED" ? (
                    <div>
                      <div className="text-xs text-gray-500">
                        KICK OFF
                      </div>

                      <div className="text-lg font-bold text-blue-400">
                        {new Date(match.utcDate).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      {match.status === "IN_PLAY"
                        ? "IN PROGRESS"
                        : match.status === "FINISHED"
                        ? "FULL TIME"
                        : null}
                    </div>
                  )}
                </div>
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

                  {match.score.fullTime.away !== null && (
                    <span className="text-2xl font-bold">
                      {match.score.fullTime.away}
                    </span>
                  )}
              </div>

              {/* Status */}
              <div className="flex justify-end items-center gap-2">
                {match.status === "IN_PLAY" && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}

                <span
                  className={`text-xs px-2 py-1 rounded font-bold ${getStatusColor(
                    match.status
                  )}`}
                >
                  {getStatusText(match.status)}
                </span>
              </div>
              {/* Prediction */}
              {prediction && (
                <div className="mt-3 rounded-lg bg-slate-800 p-3 text-sm border border-slate-700">
                  <div className="font-medium">
                    Prediction:
                    {" "}
                    {match.homeTeam.name}
                    {" "}
                    {prediction.predictedHomeScore}
                    -
                    {prediction.predictedAwayScore}
                    {" "}
                    {match.awayTeam.name}
                  </div>

                  <div>
                    Home Win:
                    {" "}
                    {(prediction.homeWinProbability * 100).toFixed(0)}%
                  </div>
                  {predictionResult && (
                    <div className={`mt-2 font-semibold ${predictionResult.colour}`}>
                      {predictionResult.label}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>

        {!loading && matches.length === 0 && (
          <p className="text-gray-400 mt-6">
            No matches found.
          </p>
        )}
      </div>
    </main>
  );
}