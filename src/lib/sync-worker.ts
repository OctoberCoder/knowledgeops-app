import prisma from './db'
import { execSync } from 'child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export async function processSyncJob(jobId: string): Promise<void> {
  const job = await prisma.syncJob.findUnique({
    where: { id: jobId },
    include: { repo: { include: { workspace: true } } },
  })
  if (!job || job.status !== 'queued') return

  await prisma.syncJob.update({
    where: { id: jobId },
    data: { status: 'running', startedAt: new Date() },
  })

  const cloneDir = mkdtempSync(join(tmpdir(), 'kb-sync-'))
  try {
    const cloneUrl = `https://x-access-token:${process.env.GITHUB_APP_TOKEN}@github.com/${job.repo.owner}/${job.repo.name}.git`
    execSync(`git clone --depth 1 ${cloneUrl} .`, { cwd: cloneDir, timeout: 120_000 })

    const cloudConfig = {
      embedding: { model: 'text-embedding-3-small', provider: 'noop' },
      chunk_size: 500,
      chunk_overlap: 50,
      providers: {
        foundry: {
          search_endpoint: process.env.AZURE_SEARCH_ENDPOINT!,
          index_name: `kb-${job.repo.workspaceId}`,
          vector_dimensions: 2,
          api_key: process.env.AZURE_SEARCH_API_KEY!,
        },
      },
    }
    writeFileSync(join(cloneDir, 'knowledgeops.yaml'), JSON.stringify(cloudConfig, null, 2))
    mkdirSync(join(cloneDir, 'environments'), { recursive: true })
    writeFileSync(join(cloneDir, 'environments', 'cloud.yaml'), JSON.stringify(cloudConfig, null, 2))

    execSync(`npx @knowledgeops/cli sync --env cloud`, { cwd: cloneDir, timeout: 180_000, stdio: 'pipe' })

    await prisma.syncJob.update({
      where: { id: jobId },
      data: { status: 'success', finishedAt: new Date() },
    })
    await prisma.repo.update({
      where: { id: job.repo.id },
      data: { lastSyncedAt: new Date(), syncStatus: 'success' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await prisma.syncLog.create({
      data: { syncJobId: jobId, level: 'error', message },
    })
    await prisma.syncJob.update({
      where: { id: jobId },
      data: { status: 'failed', errorMessage: message, finishedAt: new Date() },
    })
    await prisma.repo.update({
      where: { id: job.repo.id },
      data: { syncStatus: 'failed' },
    })
  } finally {
    rmSync(cloneDir, { recursive: true, force: true })
  }
}
