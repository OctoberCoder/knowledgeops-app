import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Email from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.resend.com',
        port: 465,
        auth: { user: 'resend', pass: process.env.AUTH_RESEND_KEY },
      },
      from: process.env.AUTH_EMAIL_FROM || 'noreply@knowledgeops.com',
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
})
