export function RepoCard({ repo }: { repo: { id: string; owner: string; name: string; syncStatus: string; lastSyncedAt: Date | null } }) {
  return (
    <a href={`/dashboard/repos/${repo.id}`} className="block p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{repo.owner}/{repo.name}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {repo.lastSyncedAt ? `Last synced ${repo.lastSyncedAt.toLocaleDateString()}` : 'Never synced'}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${repo.syncStatus === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
          {repo.syncStatus}
        </span>
      </div>
    </a>
  )
}
