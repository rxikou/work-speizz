# account-guard

Keeps your work and personal GitHub accounts from mixing.

Before Claude runs a `git commit` or `git push`, the mod looks up the GitHub owner
of the repo (from the remote URL) and checks the repo's git identity against the
accounts you registered:

- A repo owned by one of your accounts must use **that** account's email (and, for
  pushes, its GitHub login).
- Any other repo must **not** use one of those emails or logins.

On a mismatch the command is blocked with the reason, before anything is written.

## Setup

Your accounts live in your global git config, never in this repo:

```
git config --global accountguard.<owner>.email you@example.com
git config --global accountguard.<owner>.login <github-login>   # optional, checked on push
```

Add one block per account you want protected. With no accounts configured, the
mod does nothing.

Pair it with git's folder rules so the right identity is picked automatically:

```ini
# ~/.gitconfig
[includeIf "gitdir/i:C:/Users/me/Personal/"]
    path = ~/.gitconfig-personal
```

## Install

See the [repo's Quick Setup](../../README.md#quick-setup), or run:

```bash
claude plugin install account-guard --marketplace rxikou/work-speizz
```

## Limits

It guards the git commands **Claude** runs. Commits you type in your own terminal
are covered by the `includeIf` folder rule above, not by this mod.
