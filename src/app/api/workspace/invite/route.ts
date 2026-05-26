import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { email } = await req.json()
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id, role: { in: ['owner', 'admin'] } },
  })
  if (!member) return Response.json({ error: 'not authorized to invite' }, { status: 403 })

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) return Response.json({ error: 'user not found' }, { status: 404 })

  await prisma.workspaceMember.create({
    data: { workspaceId: member.workspaceId, userId: targetUser.id, role: 'member' },
  })

  return Response.json({ ok: true })
}
