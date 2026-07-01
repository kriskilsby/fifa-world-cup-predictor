// frontend/app/page.tsx
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";

import DashboardStats from "./components/DashboardStats";
import Filters from "./components/Filters";
import MatchCard from "./components/MatchCard";
import { Match } from "./types/match";
import { Prediction } from "./types/prediction";
import TeamAccuracy from "./components/TeamAccuracy";


export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  console.log("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);
  console.log("API_URL =", API_URL);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/matches`);

      if (!res.ok) {
        throw new Error(`Failed to fetch matches: ${res.status}`);
      }

      const data = await res.json();
      setMatches(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/predictions/model`);

      if (!res.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const data = await res.json();

      setPredictions(data);
    } catch (err: unknown) {
      console.error(err);
    }
  }, [API_URL]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMatches();
      void fetchPredictions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchMatches, fetchPredictions]);

  async function refreshMatches() {
    try {
      setLoading(true);

      await fetch(`${API_URL}/matches/refresh`, {
        method: "POST",
      });

      await fetchMatches();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchesSearch =
        match.homeTeam.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        match.awayTeam.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesGroup =
        selectedGroup === "ALL" ||
        match.group === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [matches, search, selectedGroup]);

  // const predictionMap = new Map(
  //   predictions.map((prediction) => [
  //     prediction.match.id,
  //     prediction,
  //   ])
  // );

  const predictionMap = useMemo(() => {
    return new Map(
      predictions.map((prediction) => [
        prediction.match.id,
        prediction,
      ])
    );
  }, [predictions]);

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          FIFA World Cup Predictor
        </h1>

        <p className="text-slate-400 mt-2">
          AI-powered match predictions, tournament statistics and live results.
        </p>
      </div>

        
        <DashboardStats
          exactScores={exactScores}
          correctResults={correctResults}
          incorrectResults={incorrectResults}
          accuracy={accuracy}
        />

        <TeamAccuracy teamStats={teamStats} />
        

        <Filters
          search={search}
          setSearch={setSearch}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          groups={groups}
          onRefresh={refreshMatches}
        />

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          </div>
        )}

        {/* Retry button */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-white p-4 rounded-lg mb-4">
            <p className="mb-3">
              {error}
            </p>

            <button
              onClick={fetchMatches}
              className="px-3 py-2 rounded bg-red-700 hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Matches
          </h2>

          <span className="text-slate-400">
            {filteredMatches.length} matches
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictionMap.get(match.id)}
            />
          ))}
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