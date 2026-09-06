export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-2">Smoker</h1>
        <p className="text-zinc-600 mb-8">
          Software supply chain attack prevention.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Package name
            </label>
            <input
              type="text"
              placeholder="e.g. axios, lodash, react"
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Registry
            </label>
            <select className="w-full border border-zinc-300 rounded px-3 py-2 text-sm">
              <option value="npm">npm</option>
              <option value="pypi">PyPI</option>
              <option value="crates">crates.io</option>
            </select>
          </div>

          <button className="bg-black text-white px-4 py-2 rounded text-sm font-medium">
            Scan
          </button>
        </div>

        <div className="mt-12 border border-zinc-200 rounded p-6">
          <h2 className="text-sm font-medium mb-4">Scan Results</h2>
          <p className="text-zinc-500 text-sm">
            No scans yet. Enter a package name above to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
