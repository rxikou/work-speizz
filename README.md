<div align="center">

# work-speizz

**My personal collection of Claude Code mods.**

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-D97757)](.claude-plugin/marketplace.json)
![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Mods](https://img.shields.io/badge/mods-2%20%2B%202%20linked-8A63D2)

[Quick Setup](#quick-setup) •
[Mods](#mods) •
[Repo layout](#repo-layout) •
[Add a mod](#add-a-new-mod) •
[Credits](#credits)

</div>

> [!TIP]
> **Installing with Claude Code?** Give it this repo's URL and ask it to follow
> [`INSTALL.md`](INSTALL.md). It lists the mods, asks which ones you want and where,
> and waits for your answer before installing anything.

---

## Quick Setup

Paste this into Claude Code:

```text
Install Claude Code mods from https://github.com/rxikou/work-speizz
```

Claude reads [`INSTALL.md`](INSTALL.md), shows the available mods, and asks you two
questions before changing anything:

1. **Which mods?** For example `1, 3` or `all`.
2. **Where?** Globally (`~/.claude/`, every project) or only in the current
   project (`./.claude/`).

It then installs them with `claude plugin install`, which adds to your existing
settings instead of overwriting them. Restart Claude Code afterwards.

<details>
<summary><b>Install without Claude</b></summary>

<br>

From any terminal, install the mods you want:

```bash
claude plugin marketplace add rxikou/work-speizz
claude plugin install done-chime@work-speizz
claude plugin install account-guard@work-speizz
```

These install globally. For the current project only, add `--scope project` to
every line. The linked mods install the same way from their own marketplaces
(see [`linked-mods.json`](linked-mods.json)).

</details>

## Mods

| # | Mod | What it does |
| --- | --- | --- |
| 1 | [**done-chime**](mods/done-chime/) | A soft pixel "sprite" chirps a random voice line whenever Claude finishes a task. `/sounds` opens a sound board. |
| 2 | [**account-guard**](mods/account-guard/) | Blocks Claude's `git commit` / `push` when the git identity doesn't match the repo's GitHub owner, so work and personal accounts never mix. |

Each mod's folder has a README with setup and details.

### Linked mods

Third-party mods that the installer offers too. They install straight from their
authors' own marketplaces (listed in [`linked-mods.json`](linked-mods.json)).

| # | Mod | What it does |
| --- | --- | --- |
| 3 | [**Prismantis**](https://github.com/NahumLitvin/prismantis) | Colorful, themeable replies: tables, alerts, diagrams and copy buttons. |
| 4 | [**Filetree**](https://github.com/data-goblin/claude-code-filetree) | IDE-style file tree pane with git status and the files Claude touches. |

<details>
<summary><b>My options for the linked mods</b></summary>

<br>

Tokyo Night across both. Set them from each mod's options, or paste this into
`pluginConfigs` in `~/.claude/settings.json`:

```json
{
  "prismantis@prismantis": {
    "options": {
      "theme": "tokyo-night",
      "desktopColors": "off",
      "tableStyle": "box",
      "copyButtonStyle": "dim",
      "copyButtons": true,
      "textCopyButtons": true,
      "promptStyle": "framed"
    }
  },
  "filetree@claude-code-filetree": {
    "options": {
      "palette": "fg=#c0caf5 accent=#7aa2f7 muted=#737aa2 urgent=#f7768e selection=#283457 hover=#292e42 jump=#bb9af7 added=#9ece6a modified=#e0af68 renamed=#7dcfff add=#9ece6a del=#f7768e"
    }
  }
}
```

</details>

## Repo layout

```text
work-speizz/
├── INSTALL.md                        # step-by-step installer that Claude Code follows
├── .claude-plugin/marketplace.json   # makes this repo a plugin marketplace
├── linked-mods.json                  # third-party mods the installer also offers
├── mods/                             # one self-contained plugin per folder
│   ├── done-chime/
│   │   ├── .claude-plugin/plugin.json
│   │   ├── hooks/                    # finish chime + /sounds board
│   │   └── sounds/                   # synthesized .wav clips
│   └── account-guard/
│       ├── .claude-plugin/plugin.json
│       └── hooks/                    # git identity check before commit/push
└── tools/sounds/                     # dev only: Python generators for done-chime's clips
```

## Add a new mod

1. Put it in `mods/<name>/` with its `.claude-plugin/plugin.json` and a `README.md`
   whose first paragraph sums it up. `INSTALL.md` uses that paragraph in its list.
2. Register it in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json):

   ```json
   { "name": "<name>", "source": "./mods/<name>", "description": "<one line>" }
   ```

3. Validate it:

   ```bash
   claude plugin validate mods/<name>
   ```

4. Add a row to the [Mods](#mods) table.

## Credits

This collection builds on other people's work. Third-party mods are **linked, not
copied**: they install straight from their authors' repos, so their code, updates
and licenses stay with them.

| Project | Author | License | How it's used |
| --- | --- | --- | --- |
| [Prismantis](https://github.com/NahumLitvin/prismantis) | Nahum Litvin ([@NahumLitvin](https://github.com/NahumLitvin)) | MIT | Linked: colorful, themeable replies, installed from its own marketplace via [`linked-mods.json`](linked-mods.json) |
| [Filetree](https://github.com/data-goblin/claude-code-filetree) | Kurt Buhler ([@data-goblin](https://github.com/data-goblin)) | MIT | Linked: IDE-style file tree pane, installed from its own marketplace via [`linked-mods.json`](linked-mods.json) |

<details>
<summary><b>Adding someone else's mod</b></summary>

<br>

1. Check its license. Without one, link to it only and never copy it in.
2. Link it: add `{ "plugin": "<name>@<marketplace>", "marketplace": "<owner>/<repo>" }`
   to [`linked-mods.json`](linked-mods.json).
3. Add a row to the [Linked mods](#linked-mods) table and to the table above: name,
   author, license, how it's used.
4. If you ever **copy** code in instead, keep its `LICENSE` in that folder, keep the
   author in its `plugin.json`, and list it in a `THIRD_PARTY_NOTICES.md`.

</details>

---

<div align="center">

My own code here is released under the [MIT License](LICENSE).
Third-party mods keep their own licenses (see [Credits](#credits)).

</div>
