import { auth } from '@/lib/auth'
import { getGitHubApp } from '@/lib/github'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const installationId = searchParams.get('installation_id')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/repos/new?error=installation_denied', req.url))
  }

  if (!installationId) {
    return NextResponse.redirect(new URL('/dashboard/repos/new?error=no_installation_id', req.url))
  }

  let workspaceId = state

  if (!workspaceId) {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=/dashboard/repos/new', req.url))
    }
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
    })
    if (!member) {
      return NextResponse.redirect(new URL('/dashboard/repos/new?error=no_workspace', req.url))
    }
    workspaceId = member.workspaceId
  }

  try {
    const app = getGitHubApp()
    const octokit = await app.getInstallationOctokit(Number(installationId))
    const { data } = await octokit.request('GET /installation/repositories')

    for (const repo of data.repositories) {
      await prisma.repo.upsert({
        where: { githubRepoId: repo.id },
        update: {
          workspaceId,
          installationId: BigInt(installationId),
          installedAt: new Date(),
        },
        create: {
          workspaceId,
          githubRepoId: repo.id,
          owner: repo.owner.login,
          name: repo.name,
          fullName: repo.full_name,
          defaultBranch: repo.default_branch || 'main',
          installationId: BigInt(installationId),
        },
      })
    }

    const url = new URL('/dashboard', req.url)
    url.searchParams.set('success', `Connected ${data.repositories.length} repo(s)`)
    return NextResponse.redirect(url)
  } catch (err) {
    console.error('Install callback error:', err)
    const url = new URL('/dashboard/repos/new', req.url)
    url.searchParams.set('error', 'failed_to_connect')
    return NextResponse.redirect(url)
  }
}