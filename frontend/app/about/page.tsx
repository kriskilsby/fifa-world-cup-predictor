import Header from "../components/Header";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            About
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            About the FIFA World Cup Predictor
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            This project brings together live match data, predictive modelling, and a simple dashboard so you can follow the tournament with context.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">What it does</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              It shows predictions, match outcomes, and performance trends in one view.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Why it exists</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              The goal is to make tournament analysis feel clean, quick, and easy to follow.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
