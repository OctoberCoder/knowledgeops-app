import { App } from '@octokit/app'

export function getGitHubApp() {
  return new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    webhooks: { secret: process.env.GITHUB_APP_WEBHOOK_SECRET! },
  })
}
