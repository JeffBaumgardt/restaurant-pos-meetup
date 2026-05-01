"use client";

export default function PosHeader(props: { onResetDemo: () => void }) {
  const { onResetDemo } = props;

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-400">
          Meetup demo POS
        </p>
        <h1 className="text-lg font-semibold text-white">Floor overview</h1>
      </div>
      <button
        type="button"
        className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
        onClick={() => void onResetDemo()}
      >
        Reset demo data
      </button>
    </header>
  );
}
