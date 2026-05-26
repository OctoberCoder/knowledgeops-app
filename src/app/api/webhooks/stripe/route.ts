import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'invalid signature' }, { status: 401 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata!.workspaceId
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan: 'pro', stripeCustomerId: session.customer as string },
      })
      await prisma.subscription.create({
        data: {
          workspaceId,
          stripeSubscriptionId: session.subscription as string,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const periodEnd = sub.items.data[0]?.current_period_end
      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        },
      })
      break
    }
    case 'customer.subscription.deleted': {
      const deleted = event.data.object as Stripe.Subscription
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: deleted.id },
      })
      if (subscription) {
        await prisma.workspace.update({
          where: { id: subscription.workspaceId },
          data: { plan: 'free' },
        })
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'canceled' },
        })
      }
      break
    }
  }

  return Response.json({ ok: true })
}
