import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function NewRepoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/dashboard/repos/new')

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (!member) redirect('/dashboard')

  const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'knowledgeops-cloud'
  const installUrl = `https://github.com/apps/${appName}/installations/new?state=${member.workspaceId}`

  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold mb-4">Connect a Repository</h1>
      <p className="text-slate-400 mb-8">Install the KnowledgeOps GitHub App on your KB repository to enable auto-sync.</p>
      <a
        href={installUrl}
        className="inline-block py-3 px-6 bg-blue-600 rounded-lg font-medium hover:bg-blue-700"
      >
        Install GitHub App
      </a>
    </div>
  )
}