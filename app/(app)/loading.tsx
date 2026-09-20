export default function AppLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="h-4 w-28 rounded bg-zinc-200" />

      <div className="mt-3 h-8 w-64 rounded bg-zinc-200" />

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({
          length: 4,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl border border-zinc-200 bg-white"
            />
          ),
        )}
      </div>

      <div className="mt-6 h-72 rounded-2xl border border-zinc-200 bg-white" />
    </div>
  );
}