// frontend/app/about/page.tsx
import Header from "../components/Header";
import { Card } from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";

const externalLinkClassName =
  "inline-flex items-center gap-1 text-white underline decoration-slate-500 underline-offset-4 transition hover:text-blue-300 hover:decoration-blue-300 focus-visible:text-blue-300 focus-visible:decoration-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header section */}
        <Card className="rounded-2xl p-6 sm:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            About
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            FIFA World Cup Predictor
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-400">
            This application is a full-stack World Cup prediction system that combines historical football data,
            Elo-based statistical modelling, and live match updates to generate tournament predictions and insights.
          </p>
        </Card>

        {/* Data sources + ingestion */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl p-6">
            <SectionTitle
              title="Data Sources"
              description="The system aggregates football data from multiple sources to build a reliable dataset for predictions:"
            />

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-400">
              <li>
                <a
                  href="https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLinkClassName}
                >
                  Kaggle dataset
                </a>
                : used for historical international match results and baseline statistical data.
              </li>

              <li>
                <a
                  href="https://www.football-data.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLinkClassName}
                >
                  football-data.org API
                </a>
                : provides live tournament fixtures, scores, and match status updates.
              </li>
              <li>
                Data is stored in <span className="text-white">PostgreSQL</span> to avoid repeated API calls and to maintain a local historical record.
              </li>
            </ul>
          </Card>

          {/* Prediction model */}
          <Card className="rounded-2xl p-6">
            <SectionTitle
              title="Prediction Model"
              description="Predictions are generated using a deterministic Elo-based rating system:"
            />

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>
                <span className="text-white">Elo ratings</span>: each team has a stored rating in PostgreSQL representing relative strength.
              </li>
              <li>
                <span className="text-white">Expected outcome formula</span>: converts rating differences into win probabilities.
              </li>
              <li>
                <span className="text-white">Rule-based score mapping</span>: probability thresholds determine final predicted scorelines.
              </li>
            </ul>

            <p className="mt-4 text-sm text-slate-500">
              Predictions are precomputed and stored in the database rather than generated on every request.
            </p>
          </Card>

          <Card className="rounded-2xl p-6 md:col-span-2">
            <SectionTitle title="How Predictions Work" />

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Predictions are generated using an Elo-based rating system trained on historical match data.
            </p>

            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-400">
              <p>
                Team ratings are initially set to <span className="text-white">1500 Elo</span> and then calibrated using a
                bootstrap process, which replays historical match results chronologically. Each match updates team strength using
                the standard Elo update formula, with a fixed <span className="text-white">K-factor of 32</span>.
              </p>

              <p>
                Once trained, these ratings are stored in <span className="text-white">PostgreSQL</span> and used as the foundation
                for live predictions.
              </p>

              <p>
                For upcoming fixtures, the system calculates expected outcomes using the Elo probability formula, converting rating
                differences into win probabilities. These probabilities are then mapped into deterministic scorelines using a rule-based
                threshold system.
              </p>

              <p>
                This ensures predictions are both explainable and consistent, while still reflecting long-term team performance trends
                derived from historical data.
              </p>
            </div>
          </Card>

          {/* Architecture */}
          <Card className="rounded-2xl p-6 md:col-span-2">
            <SectionTitle
              title="System Architecture"
              description="The system is designed as a full-stack, data-driven application with a clear separation between ingestion, prediction, and presentation layers."
            />

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>
                <span className="text-white">NestJS backend</span> handles match ingestion, prediction generation, and scheduled refresh logic.
              </li>
              <li>
                <span className="text-white">NextJS frontend</span> provides a responsive dashboard for predictions, match tracking, and analytics.
              </li>
              <li>
                <span className="text-white">PostgreSQL database</span> acts as both a persistent store and a caching layer for API data and predictions.
              </li>
              <li>
                <span className="text-white">Docker Compose</span> orchestrates services for consistent local and production deployment.
              </li>
            </ul>
          </Card>

          {/* refresh + performance */}
          <Card className="rounded-2xl p-6 md:col-span-2">
            <SectionTitle
              title="Data Refresh & Optimisation"
              description="To manage external API limitations and ensure performance, the system uses a hybrid refresh strategy:"
            />

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>
                Match and team data are cached in PostgreSQL to reduce dependency on repeated API requests.
              </li>
              <li>
                An hourly scheduler performs full dataset synchronisation.
              </li>
              <li>
                During active matches (<span className="text-white">TIMED / IN_PLAY</span>), the system enters a short-interval refresh cycle.
              </li>
              <li>
                Once matches are <span className="text-white">FINISHED</span>, live polling stops automatically and the system reverts to hourly updates.
              </li>
            </ul>
          </Card>

          {/* tech stack */}
          <Card className="rounded-2xl p-6 md:col-span-2">
            <SectionTitle title="Tech Stack" />

            <ul className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
              <li>• NestJS (backend API + scheduler)</li>
              <li>• NextJS (frontend UI)</li>
              <li>• Tailwind CSS (styling)</li>
              <li>• PostgreSQL (data storage + caching)</li>
              <li>• Docker Compose (deployment orchestration)</li>
              <li>• football-data.org API (live match data)</li>
              <li>• Kaggle datasets (historical training data)</li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
}