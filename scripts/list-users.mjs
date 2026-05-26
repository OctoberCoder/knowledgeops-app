import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const users = await prisma.user.findMany({
  orderBy: { createdAt: 'desc' },
  include: {
    memberships: {
      include: { workspace: { include: { repos: true, members: true } } },
    },
  },
})

console.log(`\nUsers (${users.length}):`)
for (const u of users) {
  for (const m of u.memberships) {
    const w = m.workspace
    console.log(`  ${u.name || '?'} (${u.email || u.githubUsername || 'no email'})`)
    console.log(`    Workspace: ${w.name} | Plan: ${w.plan} | Members: ${w.members.length} | Repos: ${w.repos.length}`)
    console.log(`    Created: ${u.createdAt.toISOString().split('T')[0]}`)
  }
}

await prisma.$disconnect()
