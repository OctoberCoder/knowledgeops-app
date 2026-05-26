'use client'
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
      <p className="text-slate-400 mb-6 max-w-md">{error.message}</p>
      <button onClick={reset} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
        Try again
      </button>
    </div>
  )
}
