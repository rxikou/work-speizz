<div align="center">

# work-speizz

**My personal collection of Claude Code mods.**

One repo to install them all on any machine.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-D97757)](.claude-plugin/marketplace.json)
![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Mods](https://img.shields.io/badge/mods-2-8A63D2)

[Quick start](#-quick-start) •
[Mods](#-mods) •
[Repo layout](#-repo-layout) •
[Add a mod](#%EF%B8%8F-add-a-new-mod) •
[Credits](#-credits)

</div>

---

##  Quick start

```bash
git clone https://github.com/rxikou/work-speizz.git
cd work-speizz
```

| Platform | Command |
| --- | --- |
| Windows | `powershell -ExecutionPolicy Bypass -File scripts\install.ps1` |
| macOS / Linux / WSL | `bash scripts/install.sh` |

The installer:

1. **Installs** every mod listed in the marketplace.
2. **Installs** the linked third-party mods in [`linked-mods.json`](linked-mods.json) (Prismantis, Filetree) from their authors' own marketplaces.

It leaves your Claude Code settings alone, apart from what `claude plugin install` records.

> [!TIP]
> To install only my own mods, add `-SkipLinked` on Windows or `--skip-linked` on macOS/Linux.

<details>
<summary><b>Install a single mod instead</b></summary>

<br>

At a Claude Code prompt:

```
/plugin install done-chime --marketplace rxikou/work-speizz
```

Answer `y` to add the marketplace, then pick a scope.

</details>

##  Mods

| Mod | What it does |
| --- | --- |
| [**done-chime**](mods/done-chime/) | A soft pixel "sprite" chirps a random voice line whenever Claude finishes a task. `/sounds` opens a sound board. |
| [**account-guard**](mods/account-guard/) | Blocks Claude's `git commit` / `push` when the git identity doesn't match the repo's GitHub owner, so work and personal accounts never mix. |

Each mod's folder has its own README with setup and details.

### Linked mods

| Mod | What it does |
| --- | --- |
| [**Prismantis**](https://github.com/NahumLitvin/prismantis) | Colorful, themeable replies: tables, alerts, diagrams and copy buttons. |
| [**Filetree**](https://github.com/data-goblin/claude-code-filetree) | IDE-style file tree pane with git status and the files Claude touches. |

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

##  Repo layout

```
work-speizz/
├── .claude-plugin/marketplace.json   # makes this repo a plugin marketplace
├── mods/                             # Claude Code mods, each a self-contained plugin
│   ├── done-chime/
│   └── account-guard/
├── linked-mods.json                  # third-party mods the installers pull in
├── scripts/                          # one-shot installers (install.ps1, install.sh)
└── tools/sounds/                     # generators for the mods' original, synthesized sounds
```

##  Add a new mod

1. Put it in `mods/<name>/` with its `.claude-plugin/plugin.json`.
2. Register it in `.claude-plugin/marketplace.json`:

   ```json
   { "name": "<name>", "source": "./mods/<name>" }
   ```

3. Validate it:

   ```
   claude plugin validate mods/<name>
   ```

##  Credits

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
3. Add a row to the table above: name, author, license, how it's used.
4. If you ever **copy** code in instead, keep its `LICENSE` in that folder, keep the
   author in its `plugin.json`, and list it in a `THIRD_PARTY_NOTICES.md`.

</details>

---

<div align="center">

My own code here is released under the [MIT License](LICENSE).
Third-party mods keep their own licenses (see [Credits](#-credits)).

</div>
