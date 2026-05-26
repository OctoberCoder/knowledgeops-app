import prisma from './db'

export async function checkEntitlement(workspaceId: string, metric: 'syncs' | 'docs' | 'repos'): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { _count: { select: { repos: true } } },
  })
  if (!workspace) return false

  if (workspace.plan === 'pro') return true

  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  const usage = await prisma.usageRecord.findUnique({
    where: { workspaceId_metric_periodStart: { workspaceId, metric, periodStart } },
  })

  const limits: Record<string, number> = { syncs: 100, docs: 1000, repos: 1 }
  const used = usage?.count || 0

  if (metric === 'repos') return workspace._count.repos < limits.repos
  return used < limits[metric]
}
