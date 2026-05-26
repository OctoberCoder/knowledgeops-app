import prisma from '@/lib/db'
import DashboardLayout from '@/components/dashboard-layout'

export default async function RepoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const repo = await prisma.repo.findUnique({
    where: { id },
    include: {
      syncJobs: { orderBy: { createdAt: 'desc' }, take: 20, include: { logs: true } },
    },
  })
  if (!repo) return <DashboardLayout><div>Repo not found</div></DashboardLayout>

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-2">{repo.owner}/{repo.name}</h1>
      <p className="text-slate-500 mb-6">Status: {repo.syncStatus} | Last synced: {repo.lastSyncedAt?.toLocaleString() || 'never'}</p>
      <h2 className="text-lg font-semibold mb-4">Sync History</h2>
      <div className="space-y-2">
        {repo.syncJobs.map(job => (
          <div key={job.id} className="p-3 rounded-lg border border-slate-800 text-sm">
            <div className="flex justify-between">
              <span className={job.status === 'success' ? 'text-green-400' : job.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}>{job.status}</span>
              <span className="text-slate-500">{job.createdAt.toLocaleString()}</span>
            </div>
            {job.errorMessage && <p className="text-red-400 mt-1">{job.errorMessage}</p>}
            {job.logs.slice(0, 5).map(log => (
              <p key={log.id} className="text-slate-500 mt-1">{log.level}: {log.message}</p>
            ))}
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
