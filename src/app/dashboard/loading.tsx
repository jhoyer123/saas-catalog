// app/loading.jsx

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden md:flex w-51.25 min-w-51.25 border-r border-gray-100 flex-col py-5">
        {/* Logo */}
        <div className="flex flex-col items-center pb-4 px-4">
          <div className="w-11 h-11 rounded-lg bg-gray-200 animate-pulse" />
          <div className="w-20 h-3 mt-3 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="border-t border-gray-100 mb-2" />

        {/* Menu label */}
        <div className="w-10 h-2.5 mx-5 mt-4 mb-2 rounded bg-gray-200 animate-pulse" />

        {/* Nav items */}
        {[88, 96, 80, 104].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5 px-5 py-2.5">
            <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
            <div
              className="h-3 rounded bg-gray-200 animate-pulse"
              style={{ width: w }}
            />
          </div>
        ))}

        {/* User footer */}
        <div className="mt-auto flex items-center gap-2.5 px-5 pt-4 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="w-20 h-3 rounded bg-gray-200 animate-pulse" />
            <div className="w-28 h-2.5 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 md:px-9 py-5 overflow-x-hidden">
        {/* Toggle */}
        <div className="w-6 h-5 rounded bg-gray-200 animate-pulse mb-6" />

        {/* Page title */}
        <div className="mb-7">
          <div className="w-44 h-5 rounded bg-gray-200 animate-pulse mb-2.5" />
          <div className="w-72 md:w-96 h-3 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
          {/* Card 1 */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
              <div className="w-36 h-4 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="w-3/4 h-3 rounded bg-gray-200 animate-pulse mb-5" />
            <div className="w-full h-9 rounded-md bg-gray-200 animate-pulse mb-4" />
            <div className="w-28 h-9 rounded-md bg-gray-200 animate-pulse" />
          </div>

          {/* Card 2 */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
              <div className="w-24 h-4 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="w-3/5 h-3 rounded bg-gray-200 animate-pulse mb-6" />
            <div className="w-32 h-9 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
