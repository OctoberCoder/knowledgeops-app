import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')
  if (session.user.email !== 'george@tasksystems.com') redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      memberships: {
        include: {
          workspace: {
            include: { _count: { select: { repos: true, members: true } } },
          },
        },
      },
    },
  })

  const totalRepos = await prisma.repo.count()
  const totalWorkspaces = await prisma.workspace.count()
  const totalSyncs = await prisma.syncJob.count()

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-sm text-slate-400">Users</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-2xl font-bold">{totalWorkspaces}</div>
          <div className="text-sm text-slate-400">Workspaces</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-2xl font-bold">{totalRepos}</div>
          <div className="text-sm text-slate-400">Repos Connected</div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-2">Users</h2>
        {users.map(u => u.memberships.map(m => (
          <div key={m.id} className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
            <div className="font-medium">{u.name || 'Unnamed'}</div>
            <div className="text-sm text-slate-400">{u.email || 'No email'} {u.githubUsername ? `(@${u.githubUsername})` : ''}</div>
            <div className="text-sm text-slate-400">
              Workspace: {m.workspace.name} &middot; Plan: {m.workspace.plan}
              &middot; {m.workspace._count.repos} repos &middot; {m.workspace._count.members} members
            </div>
            <div className="text-xs text-slate-500">Signed up: {u.createdAt.toISOString().split('T')[0]}</div>
          </div>
        )))}
        {users.length === 0 && <p className="text-slate-400">No users yet.</p>}
      </div>

      <p className="mt-8 text-xs text-slate-500">Total sync runs: {totalSyncs}</p>
    </div>
  )
}