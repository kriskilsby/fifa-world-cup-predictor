// frontend/app/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import DashboardStats from "./components/DashboardStats";
import Filters from "./components/Filters";
import Header from "./components/Header";
import MatchCard from "./components/MatchCard";
import TeamAccuracy from "./components/TeamAccuracy";
import { Card } from "./components/ui/Card";
import SectionTitle from "./components/ui/SectionTitle";
import { Match } from "./types/match";
import { Prediction } from "./types/prediction";

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showQuickNav, setShowQuickNav] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const isInitialLoading = loading && matches.length === 0;
  const isRefreshing = loading && matches.length > 0;

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
      const message = err instanceof Error ? err.message : "Something went wrong";
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
    const liveMatchActive = matches.some(
      (match) => ["TIMED", "IN_PLAY", "PAUSED"].includes(match.status) && new Date(match.utcDate) <= new Date()
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
    if (predictionHome === actualHome && predictionAway === actualAway) {
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
      actualHome > actualAway ? "HOME" : actualHome < actualAway ? "AWAY" : "DRAW";

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

  const groups = Array.from(new Set(matches.map((match) => match.group))).filter(Boolean);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchesSearch =
        match.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
        match.awayTeam.name.toLowerCase().includes(search.toLowerCase());

      const matchesGroup = selectedGroup === "ALL" || match.group === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [matches, search, selectedGroup]);

  const predictionMap = useMemo(() => {
    return new Map(predictions.map((prediction) => [prediction.match.id, prediction]));
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

  const finishedPredictions = exactScores + correctResults + incorrectResults;

  const accuracy =
    finishedPredictions > 0 ? (((exactScores + correctResults) / finishedPredictions) * 100).toFixed(1) : "0";

  const teamStatsMap: Record<string, { correct: number; total: number }> = {};

  matches.forEach((match) => {
    if (match.status !== "FINISHED") return;

    const prediction = predictionMap.get(match.id);
    if (!prediction) return;

    const actualHome = match.score.fullTime.home;
    const actualAway = match.score.fullTime.away;

    if (actualHome === null || actualAway === null) return;

    const predictedOutcome =
      prediction.predictedHomeScore > prediction.predictedAwayScore
        ? "HOME"
        : prediction.predictedHomeScore < prediction.predictedAwayScore
          ? "AWAY"
          : "DRAW";

    const actualOutcome = actualHome > actualAway ? "HOME" : actualHome < actualAway ? "AWAY" : "DRAW";
    const correct = predictedOutcome === actualOutcome;

    const teams = [match.homeTeam.name, match.awayTeam.name];

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
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header showSearch search={search} setSearch={setSearch} />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Card className="rounded-2xl bg-slate-900/70 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                Tournament dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">FIFA World Cup Predictor</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Data-driven match predictions, tournament statistics and live results.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              {isRefreshing && (
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" aria-hidden="true" />
                  Refreshing live data
                </div>
              )}

              {lastUpdatedAt && (
                <div className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-400">
                  Updated {lastUpdatedAt}
                </div>
              )}
            </div>
          </div>
        </Card>

        {isInitialLoading ? (
          <>
            <LoadingDashboardStats />
            <LoadingTeamAccuracy />
            <LoadingFilters />
          </>
        ) : (
          <>
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
          </>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-white shadow-sm sm:p-5" role="alert">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-300">
                  Could not refresh fixtures
                </p>
                <p className="text-sm leading-6 text-red-100/90">{error}</p>
              </div>

              <button
                type="button"
                onClick={fetchMatches}
                className="inline-flex items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-50 transition hover:border-red-300 hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <section id="matches-section" className="scroll-mt-24">
          <Card className="rounded-2xl bg-slate-900/70 p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle title="Matches" description="Browse live and completed fixtures with predictions." />

              <span className="text-sm text-slate-400">
                {matches.length > 0 ? `${filteredMatches.length} matches` : "No fixtures loaded yet"}
              </span>
            </div>

            {isInitialLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <MatchCardSkeleton key={index} />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center sm:p-8">
                <p className="text-base font-semibold text-slate-100">No fixtures are available yet.</p>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
                  Once match data is published, fixtures and predictions will appear here automatically.
                </p>
                <button
                  type="button"
                  onClick={fetchMatches}
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Refresh data
                </button>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center sm:p-8">
                <p className="text-base font-semibold text-slate-100">No matches match your filters.</p>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
                  Try a different team search or group to reveal fixtures again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedGroup("ALL");
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMatches.map((match) => (
                  <MatchCard key={match.id} match={match} prediction={predictionMap.get(match.id)} />
                ))}
              </div>
            )}
          </Card>
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

function LoadingDashboardStats() {
  return (
    <Card className="relative overflow-hidden rounded-3xl border-slate-800/80 bg-slate-950/80 p-5 sm:p-6" aria-hidden="true">
      <div className="animate-pulse space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-44 rounded-full bg-slate-800" />
            <div className="h-8 w-72 rounded-full bg-slate-800" />
          </div>
          <div className="h-4 w-full max-w-md rounded-full bg-slate-800 sm:w-80" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 rounded-2xl border border-slate-800 bg-slate-900/80" />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded-full bg-slate-800" />
              <div className="h-4 w-56 rounded-full bg-slate-800" />
            </div>
            <div className="h-4 w-48 rounded-full bg-slate-800" />
          </div>
          <div className="mt-4 h-4 w-full rounded-full bg-slate-800" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 rounded-xl border border-slate-800 bg-slate-900/70" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function LoadingTeamAccuracy() {
  return (
    <Card className="rounded-2xl bg-slate-900/70 p-4 shadow-sm sm:p-6" aria-hidden="true">
      <div className="animate-pulse space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-40 rounded-full bg-slate-800" />
            <div className="h-7 w-72 rounded-full bg-slate-800" />
          </div>
          <div className="h-4 w-full max-w-md rounded-full bg-slate-800 sm:w-80" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-32 rounded-lg border border-slate-800 bg-slate-800/80" />
          ))}
        </div>
      </div>
    </Card>
  );
}

function LoadingFilters() {
  return (
    <Card className="rounded-2xl bg-slate-900/70 p-4 shadow-sm sm:p-6" aria-hidden="true">
      <div className="animate-pulse space-y-4">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded-full bg-slate-800" />
          <div className="h-7 w-56 rounded-full bg-slate-800" />
          <div className="h-4 w-full max-w-lg rounded-full bg-slate-800" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-12 rounded-lg border border-slate-800 bg-slate-800/80" />
          <div className="h-12 rounded-lg border border-slate-800 bg-slate-800/80" />
        </div>
      </div>
    </Card>
  );
}

function MatchCardSkeleton() {
  return (
    <div className="relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg" aria-hidden="true">
      <div className="animate-pulse space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-20 rounded-full bg-slate-800" />
            <div className="h-4 w-36 rounded-full bg-slate-800" />
          </div>
          <div className="h-8 w-20 rounded-full bg-slate-800" />
        </div>

        <div className="space-y-5 py-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800" />
            <div className="h-5 flex-1 rounded-full bg-slate-800" />
            <div className="h-8 w-12 rounded-full bg-slate-800" />
          </div>

          <div className="mx-auto h-3 w-36 rounded-full bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800" />
            <div className="h-5 flex-1 rounded-full bg-slate-800" />
            <div className="h-8 w-12 rounded-full bg-slate-800" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <div className="h-3 w-24 rounded-full bg-slate-800" />
          <div className="h-5 w-14 rounded-full bg-slate-800" />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-slate-800" />
              <div className="h-6 w-20 rounded-full bg-slate-800" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-3 w-14 rounded-full bg-slate-800" />
              <div className="h-5 w-12 rounded-full bg-slate-800" />
            </div>
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-slate-800" />
          <div className="mt-3 h-6 w-32 rounded-full bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
