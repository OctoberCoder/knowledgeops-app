import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8">
        <h1 className="text-2xl font-bold text-center">Sign in to KnowledgeOps</h1>
        <form
          action={async () => {
            'use server'
            await signIn('github', { redirectTo: '/dashboard' })
          }}
        >
          <button className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium">
            Continue with GitHub
          </button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">or</span>
          </div>
        </div>
        <form
          action={async (formData: FormData) => {
            'use server'
            await signIn('resend', { email: formData.get('email') as string, redirectTo: '/dashboard' })
          }}
        >
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full py-3 px-4 bg-slate-800 border border-slate-700 rounded-lg mb-3"
          />
          <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
            Send magic link
          </button>
        </form>
      </div>
    </div>
  )
}
