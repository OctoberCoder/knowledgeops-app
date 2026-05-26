import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import DashboardLayout from '@/components/dashboard-layout'
import { RepoCard } from '@/components/repo-card'

export default async function DashboardPage() {
  const session = await auth()
  const repos = await prisma.repo.findMany({
    where: { workspace: { members: { some: { userId: session!.user!.id } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Repositories</h1>
        <a href="/dashboard/repos/new" className="py-2 px-4 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700">Connect Repo</a>
      </div>
      {repos.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="mb-4">No repositories connected yet.</p>
          <a href="/dashboard/repos/new" className="text-blue-400 hover:underline">Connect your first repo</a>
        </div>
      ) : (
        <div className="grid gap-4">
          {repos.map(repo => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
