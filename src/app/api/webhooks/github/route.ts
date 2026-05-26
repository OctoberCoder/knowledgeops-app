import { getGitHubApp } from '@/lib/github'
import prisma from '@/lib/db'
import { processSyncJob } from '@/lib/sync-worker'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-hub-signature-256') || ''
  const name = req.headers.get('x-github-event') || ''

  const verified = await getGitHubApp().webhooks.verify(body, signature)
  if (!verified) return Response.json({ error: 'invalid signature' }, { status: 401 })

  if (name === 'push') {
    const payload = JSON.parse(body)
    const repo = await prisma.repo.findFirst({ where: { githubRepoId: payload.repository.id } })
    if (repo) {
      const job = await prisma.syncJob.create({
        data: { repoId: repo.id, status: 'queued', trigger: 'webhook' },
      })
      processSyncJob(job.id).catch(console.error)
    }
  }

  if (name === 'installation' || name === 'installation_repositories') {
    const payload = JSON.parse(body)
    if (payload.action === 'created' || payload.action === 'added') {
      for (const repo of payload.repositories) {
        await prisma.repo.upsert({
          where: { githubRepoId: repo.id },
          update: { installationId: payload.installation.id, installedAt: new Date() },
          create: {
            workspaceId: '',
            githubRepoId: repo.id,
            owner: repo.full_name.split('/')[0],
            name: repo.name,
            fullName: repo.full_name,
            defaultBranch: repo.default_branch || 'main',
            installationId: payload.installation.id,
          },
        })
      }
    }
  }

  return Response.json({ ok: true })
}
