# INSTALL.md: instructions for Claude Code

> **You are Claude Code, and a user wants mods from
> `https://github.com/rxikou/work-speizz`.** Follow these steps in order. Do not
> install anything until the user has answered both questions in step 3.

Every mod here is a Claude Code **plugin** from this repo's plugin marketplace
(`.claude-plugin/marketplace.json`). Install mods with `claude plugin install`.
Do not copy their files into `.claude/` and do not hand-edit `settings.json`. The
plugin command fetches the mod, records it in the right settings file and merges
it with the user's existing settings, so nothing the user already has is
overwritten.

## 1. Get the catalog

If this repo is already open (the working directory contains
`.claude-plugin/marketplace.json`), read it from there. Otherwise, make a
shallow clone into a new temporary folder:

```bash
git clone --depth 1 https://github.com/rxikou/work-speizz.git "<temp-dir>/work-speizz"
```

Use the system temp directory (or your session scratchpad), not the user's
project. Only read the clone; never run any script from it.

## 2. List the mods

Build one numbered list from:

1. Every entry in `.claude-plugin/marketplace.json` → `plugins`. These are the
   repo's own mods. For each one, use its `description` and the first paragraph of
   `mods/<name>/README.md` as the summary.
2. Every entry in `linked-mods.json` → `mods`. These are **third-party** mods that
   install from their authors' own marketplaces. Mark them `(third-party)` and
   summarize them from the "Linked mods" table in `README.md`.

Show it to the user like this, one line each, with summaries taken from the
files rather than from this example:

```text
Available mods from rxikou/work-speizz:
  1. done-chime     A pixel sprite chirps a voice line when Claude finishes; /sounds opens a sound board
  2. account-guard  Blocks git commit/push when the git identity doesn't match the repo's GitHub owner
  3. prismantis     (third-party) Colorful, themeable replies: tables, alerts, diagrams, copy buttons
  4. filetree       (third-party) IDE-style file tree pane with git status
```

## 3. Ask, then stop

Ask the user both questions in one message (use your question tool if you have
one), then **stop and wait for the reply**:

1. **Which mods?** Numbers such as `1, 3`, or `all`.
2. **Where?**
   - **Global**: every project on this machine. Uses `--scope user`, recorded in
     `~/.claude/settings.json`.
   - **This project**: only the current project. Uses `--scope project`,
     recorded in `./.claude/settings.json`, which can be committed so teammates
     get it too.

If an answer is unclear, ask again. Don't guess.

## 4. Install

Use the scope the user chose (`user` or `project`) for **every** command below.
Add each marketplace at that same scope **before** installing from it. A
project-scope install then records the marketplace in the project's settings
too, so teammates who open the project can get the mods.

If any of the user's **own mods** were chosen (`<name>` from `marketplace.json`),
add this repo's marketplace once, then install each mod:

```bash
claude plugin marketplace add rxikou/work-speizz --scope <scope>
claude plugin install <name>@work-speizz --scope <scope>
```

For each chosen **third-party mod** (an entry in `linked-mods.json`):

```bash
claude plugin marketplace add <marketplace> --scope <scope>
claude plugin install <plugin> --scope <scope>
```

Here `<marketplace>` is the entry's `marketplace` field (for example
`NahumLitvin/prismantis`), and `<plugin>` is its `plugin` field as written (for
example `prismantis@prismantis`).

Notes:

- If `claude` isn't on PATH, do the same steps from the prompt with
  `/plugin marketplace add` and `/plugin install`.
- If a marketplace or mod is already there, say so and move on.
- If an install fails, report the error and continue with the rest.

## 5. Clean up and confirm

1. Delete the temporary clone from step 1, if you made one.
2. Tell the user what was installed, at which scope, and anything that failed.
3. Pass on the setup notes for the chosen mods:
   - **account-guard** does nothing until accounts are registered:
     `git config --global accountguard.<owner>.email you@example.com`. See
     `mods/account-guard/README.md`.
   - **done-chime** plays sounds on Windows and macOS. On Linux it stays silent.
     Type `/sounds` to open the sound board.
4. Tell them to **restart Claude Code** so the new mods load.
