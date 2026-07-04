// frontend/app/page.tsx
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";

import DashboardStats from "./components/DashboardStats";
import Filters from "./components/Filters";
import Header from "./components/Header";
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
  const [showQuickNav, setShowQuickNav] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  const refreshLiveData = useCallback(async () => {
    await Promise.all([fetchMatches(), fetchPredictions()]);
    setLastUpdatedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }, [fetchMatches, fetchPredictions]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshLiveData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshLiveData]);

  useEffect(() => {
    const liveMatchActive = matches.some((match) =>
      ["TIMED", "IN_PLAY", "PAUSED"].includes(match.status) &&
      new Date(match.utcDate) <= new Date()
    );

    if (!liveMatchActive) {
      return;
    }

    const interval = window.setInterval(() => {
      void refreshLiveData();
    }, 5 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [matches, refreshLiveData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowQuickNav(window.scrollY > 240);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  // Frontend rendering
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header showSearch search={search} setSearch={setSearch} />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                Tournament dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                FIFA World Cup Predictor
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                AI-powered match predictions, tournament statistics and live results.
              </p>
            </div>

            {lastUpdatedAt && (
              <div className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-400">
                Updated {lastUpdatedAt}
              </div>
            )}
          </div>
        </section>

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
        />

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-700 bg-red-900/40 p-4 text-white">
            <p className="mb-3">{error}</p>

            <button
              onClick={fetchMatches}
              className="rounded bg-red-700 px-3 py-2 transition hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        <section
          id="matches-section"
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Matches</h2>
              <p className="text-sm text-slate-400">
                Browse live and completed fixtures with predictions.
              </p>
            </div>

            <span className="text-sm text-slate-400">
              {filteredMatches.length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictionMap.get(match.id)}
              />
            ))}
          </div>

          {!loading && matches.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center text-slate-400">
              No matches found for the current selection.
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2 sm:hidden">
        <button
          type="button"
          onClick={scrollToTop}
          className={`rounded-full border border-slate-700 bg-slate-900/95 px-3 py-2 text-sm font-medium text-slate-100 shadow-lg transition ${
            showQuickNav ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          ↑ Top
        </button>
        <button
          type="button"
          onClick={scrollToBottom}
          className={`rounded-full border border-slate-700 bg-slate-900/95 px-3 py-2 text-sm font-medium text-slate-100 shadow-lg transition ${
            showQuickNav ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          ↓ Bottom
        </button>
      </div>
    </main>
  );
}