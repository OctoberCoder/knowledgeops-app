import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { processSyncJob } from '@/lib/sync-worker'
import { checkEntitlement } from '@/lib/entitlements'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { repoId } = await req.json()
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: { workspace: { include: { members: { where: { userId: session.user.id } } } } },
  })
  if (!repo) return Response.json({ error: 'repo not found' }, { status: 404 })
  if (repo.workspace.members.length === 0) return Response.json({ error: 'access denied' }, { status: 403 })

  if (!await checkEntitlement(repo.workspaceId, 'syncs')) {
    return Response.json({ error: 'sync limit reached for this billing period' }, { status: 403 })
  }

  const job = await prisma.syncJob.create({
    data: { repoId, status: 'queued', trigger: 'manual' },
  })

  processSyncJob(job.id).catch(console.error)

  return Response.json({ jobId: job.id })
}
