import { auth } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold">KnowledgeOps</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block py-2 px-3 rounded hover:bg-slate-800">Repositories</a>
          <a href="/dashboard/settings" className="block py-2 px-3 rounded hover:bg-slate-800">Settings</a>
          <a href="/dashboard/billing" className="block py-2 px-3 rounded hover:bg-slate-800">Billing</a>
        </nav>
        <div className="border-t border-slate-800 pt-4 mt-8 text-sm text-slate-500">
          {session?.user?.email}
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
