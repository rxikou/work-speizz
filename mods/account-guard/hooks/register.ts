import type { Hook, Register } from 'claude-code'

type Engine = Parameters<Hook<'tool.call'>>[0]

/**
 * One GitHub account and the identity that belongs to it, read from your global
 * git config so no email ever lives in this mod:
 *
 *   git config --global accountguard.<owner>.email you@example.com
 *   git config --global accountguard.<owner>.login <github-login>   (optional)
 */
export type Account = { owner: string; email?: string; login?: string }

// `git [-C dir] [-c k=v ...] commit|push ...`
const GIT_WRITE = /\bgit((?:\s+-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+))*)\s+(commit|push)\b([^;&|]*)/
const LEADING_CD = /^\s*cd\s+("[^"]*"|'[^']*'|\S+)\s*&&/

export function parseAccounts(configLines: string): Account[] {
  const byOwner = new Map<string, Account>()
  for (const line of configLines.split(/\r?\n/)) {
    const m = /^accountguard\.(.+)\.(email|login)\s+(.+)$/i.exec(line.trim())
    if (!m) continue
    const owner = (m[1] ?? '').toLowerCase()
    const acct = byOwner.get(owner) ?? { owner }
    if ((m[2] ?? '').toLowerCase() === 'email') acct.email = (m[3] ?? '').trim().toLowerCase()
    else acct.login = (m[3] ?? '').trim().toLowerCase()
    byOwner.set(owner, acct)
  }
  return [...byOwner.values()]
}

export function ownerOf(remoteUrl: string): string | undefined {
  const m = /github\.com[:/]+([^/]+)\//i.exec(remoteUrl.trim())
  return m?.[1]?.toLowerCase()
}

/** The reason to block, or undefined when the identity fits the repo's owner. */
export function mismatch(
  accounts: Account[],
  owner: string,
  email: string,
  login: string,
  isPush: boolean,
): string | undefined {
  for (const a of accounts) {
    const isTheirs = a.owner === owner
    if (isTheirs) {
      if (a.email && email !== a.email) return `repo belongs to ${owner} but git user.email is ${email || '(unset)'}; expected ${a.email}`
      if (isPush && a.login && login !== a.login) return `repo belongs to ${owner} but the GitHub login is ${login || '(default)'}; expected ${a.login}`
    } else {
      if (a.email && email === a.email) return `git user.email ${email} belongs to ${a.owner}, but this repo belongs to ${owner}`
      if (isPush && a.login && login === a.login) return `GitHub login ${login} belongs to ${a.owner}, but this repo belongs to ${owner}`
    }
  }
  return undefined
}

const unquote = (s: string) => s.replace(/^["']|["']$/g, '')

async function git($: Engine, dir: string, args: string[]) {
  const r = await $.process.run(['git', '-C', dir, ...args], { timeoutMs: 10_000 })
  return r.exitCode === 0 ? r.stdout.trim() : ''
}

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const hit = GIT_WRITE.exec(e.command)
    if (!hit) return next(e)

    const accounts = parseAccounts(await git($, '.', ['config', '--global', '--get-regexp', '^accountguard\\.']))
    if (accounts.length === 0) return next(e)

    // Where the git command runs: its own -C, else a leading `cd X &&`, else the session's folder.
    const dashC = /-C\s+("[^"]*"|'[^']*'|\S+)/.exec(hit[1] ?? '')
    const cd = LEADING_CD.exec(e.command)
    const dir = unquote(dashC?.[1] ?? cd?.[1] ?? (await $.session.cwd()))

    const isPush = hit[2] === 'push'
    const remoteArg = isPush ? /^\s+(?:-\S+\s+)*([A-Za-z0-9_.-]+)/.exec(hit[3] ?? '')?.[1] : undefined
    const remote = remoteArg && !remoteArg.startsWith('-') ? remoteArg : 'origin'

    const owner = ownerOf(await git($, dir, ['remote', 'get-url', remote]))
    if (!owner) return next(e)

    const email = (await git($, dir, ['config', 'user.email'])).toLowerCase()
    const login = (await git($, dir, ['config', 'credential.https://github.com.username'])).toLowerCase()

    const why = mismatch(accounts, owner, email, login, isPush)
    return why
      ? { deny: `account-guard: ${why}. Fix the repo's git identity (or move it under the right folder) and retry.` }
      : next(e)
  // If the check itself fails (git missing, odd command), let the call through rather than block work.
  }).catch(($, e, next) => next(e))
}
