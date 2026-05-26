export default function NewRepoPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold mb-4">Connect a Repository</h1>
      <p className="text-slate-400 mb-8">Install the KnowledgeOps GitHub App on your KB repository to enable auto-sync.</p>
      <a
        href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'knowledgeops-cloud'}/installations/new`}
        className="inline-block py-3 px-6 bg-blue-600 rounded-lg font-medium hover:bg-blue-700"
      >
        Install GitHub App
      </a>
    </div>
  )
}
