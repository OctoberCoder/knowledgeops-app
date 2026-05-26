import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import DashboardLayout from '@/components/dashboard-layout'

export default async function SettingsPage() {
  const session = await auth()
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session!.user!.id },
    include: { workspace: { include: { members: { include: { user: true } } } } },
  })
  if (!member) return null

  const { workspace } = member
  const isOwnerOrAdmin = member.role === 'owner' || member.role === 'admin'

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Workspace</h2>
        <p className="text-slate-300">Name: {workspace.name}</p>
        <p className="text-slate-500 text-sm">Slug: {workspace.slug}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">Team Members ({workspace.members.length})</h2>
        <div className="space-y-2">
          {workspace.members.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-800">
              <span className="font-medium">{m.user.name || m.user.email}</span>
              <span className="text-xs text-slate-500 capitalize">{m.role}</span>
            </div>
          ))}
        </div>
        {isOwnerOrAdmin && (
          <form action="/api/workspace/invite" method="POST" className="mt-4 flex gap-2">
            <input
              name="email"
              type="email"
              placeholder="colleague@example.com"
              required
              className="flex-1 py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-sm"
            />
            <button className="py-2 px-4 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700">
              Invite
            </button>
          </form>
        )}
      </section>
    </DashboardLayout>
  )
}
