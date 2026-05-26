import prisma from './db'

export async function processSyncJob(jobId: string) {
  const job = await prisma.syncJob.findUnique({ where: { id: jobId }, include: { repo: true } })
  if (!job) throw new Error(`SyncJob ${jobId} not found`)

  await prisma.syncJob.update({ where: { id: jobId }, data: { status: 'running', startedAt: new Date() } })

  try {
    // TODO: implement actual sync logic in a later task
    await prisma.syncJob.update({ where: { id: jobId }, data: { status: 'success', finishedAt: new Date() } })
    await prisma.repo.update({ where: { id: job.repoId }, data: { syncStatus: 'success', lastSyncedAt: new Date() } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await prisma.syncJob.update({ where: { id: jobId }, data: { status: 'failed', errorMessage: message, finishedAt: new Date() } })
    await prisma.repo.update({ where: { id: job.repoId }, data: { syncStatus: 'failed' } })
  }
}
