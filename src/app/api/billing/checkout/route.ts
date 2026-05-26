import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import prisma from '@/lib/db'

export async function POST() {
  const stripe = getStripe()
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id, role: 'owner' },
    include: { workspace: true },
  })
  if (!member) return Response.json({ error: 'not a workspace owner' }, { status: 403 })

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    metadata: { workspaceId: member.workspaceId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
  })

  return Response.json({ url: checkout.url })
}
