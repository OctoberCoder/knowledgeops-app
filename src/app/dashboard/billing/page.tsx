import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import DashboardLayout from '@/components/dashboard-layout'

export default async function BillingPage() {
  const session = await auth()
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session!.user!.id },
    include: { workspace: { include: { subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 } } } },
  })
  if (!member) return null

  const { workspace } = member
  const isPro = workspace.plan === 'pro'
  const subscription = workspace.subscriptions[0]

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      <div className="max-w-md p-6 rounded-xl border border-slate-800">
        <p className="text-lg font-semibold">
          Current plan: <span className={isPro ? 'text-blue-400' : ''}>{isPro ? 'Pro' : 'Free'}</span>
        </p>
        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-slate-500 mt-2">
            Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        <div className="mt-6 space-y-3">
          {!isPro ? (
            <>
              <p className="text-sm text-slate-400">1 repo, 1,000 docs, 100 syncs/month</p>
              <form action="/api/billing/checkout" method="POST">
                <button className="py-2 px-4 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Upgrade to Pro — $29/mo
                </button>
              </form>
            </>
          ) : (
            <a href="https://billing.stripe.com" className="text-sm text-blue-400 hover:underline">
              Manage in Stripe
            </a>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
