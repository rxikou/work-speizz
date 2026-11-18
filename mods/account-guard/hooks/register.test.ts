import { expect, test } from 'claude-code/testing'

import { mismatch, ownerOf, parseAccounts } from './register'

const accounts = parseAccounts(
  ['accountguard.rxikou.email me@personal.test', 'accountguard.rxikou.login rxikou'].join('\n'),
)

test('reads accounts from git config lines', () => {
  expect(accounts).toEqual([{ owner: 'rxikou', email: 'me@personal.test', login: 'rxikou' }])
})

test('finds the owner in https and ssh remotes', () => {
  expect(ownerOf('https://github.com/rxikou/work-speizz.git')).toBe('rxikou')
  expect(ownerOf('git@github.com:Acme-Corp/app.git')).toBe('acme-corp')
  expect(ownerOf('https://gitlab.com/x/y.git')).toBeUndefined()
})

test('personal repo with personal identity passes', () => {
  expect(mismatch(accounts, 'rxikou', 'me@personal.test', 'rxikou', true)).toBeUndefined()
})

test('personal repo with work email is blocked', () => {
  expect(mismatch(accounts, 'rxikou', 'me@work.test', 'rxikou', false)).toMatch(/expected me@personal.test/)
})

test('personal repo pushed with the wrong login is blocked', () => {
  expect(mismatch(accounts, 'rxikou', 'me@personal.test', '', true)).toMatch(/GitHub login/)
})

test('work repo with personal email is blocked', () => {
  expect(mismatch(accounts, 'acme-corp', 'me@personal.test', '', false)).toMatch(/belongs to rxikou/)
})

test('work repo with work identity passes', () => {
  expect(mismatch(accounts, 'acme-corp', 'me@work.test', '', true)).toBeUndefined()
})

test('a git commit run by Claude in a mismatched repo is denied', async ($, on) => {
  on('process.run', (_, e) => {
    const args = e.argv.join(' ')
    const out = args.includes('--get-regexp')
      ? 'accountguard.rxikou.email me@personal.test'
      : args.includes('remote get-url')
        ? 'https://github.com/rxikou/work-speizz.git'
        : args.endsWith('user.email')
          ? 'me@work.test'
          : ''
    return { value: { exitCode: 0, stdout: out, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('session.cwd', () => ({ value: '/repo' }))
  on('tool.call', () => ({ result: {} }))

  const ran = await $.tool.call({ tool: 'Bash', command: 'git commit -m "x"' })
  expect(ran.deny).toMatch(/account-guard/)

  const other = await $.tool.call({ tool: 'Bash', command: 'git status' })
  expect(other.deny).toBeUndefined()
})
