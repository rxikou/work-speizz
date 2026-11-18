<div align="center">

# work-speizz

**My personal Claude Code arsenal of configs and workflow mods.**

One repo to make any machine, and any project, feel like home.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-D97757)](.claude-plugin/marketplace.json)
![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Mods](https://img.shields.io/badge/mods-2-8A63D2)

[Quick start](#-quick-start) •
[Mods](#-mods) •
[Settings](#%EF%B8%8F-settings-highlights) •
[Repo layout](#-repo-layout) •
[Add a mod](#%EF%B8%8F-add-a-new-mod) •
[Credits](#-credits)

</div>

---

## 🚀 Quick start

```bash
git clone https://github.com/rxikou/work-speizz.git
cd work-speizz
```

| Platform | Command |
| --- | --- |
| Windows | `powershell -ExecutionPolicy Bypass -File scripts\install.ps1` |
| macOS / Linux / WSL | `bash scripts/install.sh` |

The installer:

1. **Backs up** `~/.claude/settings.json`.
2. **Merges** [`setup/settings.json`](setup/settings.json) into it, keeping anything else you have.
3. **Installs** every mod listed in the marketplace.
4. **Installs** the linked third-party plugins (ECC, Prismantis) from their authors' own marketplaces.

> [!TIP]
> To run only one half, use `-SkipSettings` / `-SkipMods` on Windows or
> `--skip-settings` / `--skip-mods` on macOS/Linux.

<details>
<summary><b>Install a single mod instead</b></summary>

<br>

At a Claude Code prompt:

```
/plugin install done-chime --marketplace rxikou/work-speizz
```

Answer `y` to add the marketplace, then pick a scope.

</details>

## 🧩 Mods

| Mod | What it does |
| --- | --- |
| 🔔 [**done-chime**](mods/done-chime/) | A soft pixel "sprite" chirps a random voice line whenever Claude finishes a task. `/sounds` opens a sound board. |
| 🛡️ [**account-guard**](mods/account-guard/) | Blocks Claude's `git commit` / `push` when the git identity doesn't match the repo's GitHub owner, so work and personal accounts never mix. |

Each mod's folder has its own README with setup and details.

## ⚙️ Settings highlights

- 🚫 No `Co-Authored-By: Claude` line on commits.
- 🔒 Claude may not open or merge pull requests (`gh pr create` / `gh pr merge` are denied).
- 🧠 Opus at high effort, with the [ECC](https://github.com/affaan-m/ECC) plugin.
- 🌈 [Prismantis](https://github.com/NahumLitvin/prismantis) for colorful, themeable replies.
- 🎨 Dark daltonized theme, with notifications on.

## 📁 Repo layout

```
work-speizz/
├── .claude-plugin/marketplace.json   # makes this repo a plugin marketplace
├── mods/                             # Claude Code mods, each a self-contained plugin
│   ├── done-chime/
│   └── account-guard/
├── setup/settings.json               # baseline Claude Code settings
├── scripts/                          # one-shot installers (install.ps1, install.sh)
└── tools/sounds/                     # generators for the mods' original, synthesized sounds
```

## 🛠️ Add a new mod

1. Put it in `mods/<name>/` with its `.claude-plugin/plugin.json`.
2. Register it in `.claude-plugin/marketplace.json`:

   ```json
   { "name": "<name>", "source": "./mods/<name>" }
   ```

3. Validate it:

   ```
   claude plugin validate mods/<name>
   ```

## 🙏 Credits

This setup builds on other people's work. Third-party plugins are **linked, not
copied**: they install straight from their authors' repos, so their code, updates
and licenses stay with them.

| Project | Author | License | How it's used |
| --- | --- | --- | --- |
| [ECC](https://github.com/affaan-m/ECC) | [@affaan-m](https://github.com/affaan-m) | MIT | Linked: added as a marketplace and enabled in [`setup/settings.json`](setup/settings.json) |
| [Prismantis](https://github.com/NahumLitvin/prismantis) | Nahum Litvin ([@NahumLitvin](https://github.com/NahumLitvin)) | MIT | Linked: colorful, themeable replies, installed from its own marketplace via [`setup/settings.json`](setup/settings.json) |

<details>
<summary><b>Adding someone else's plugin</b></summary>

<br>

1. Check its license. Without one, link to it only and never copy it in.
2. Link it: add its marketplace to `extraKnownMarketplaces` and the plugin to
   `enabledPlugins` in `setup/settings.json`.
3. Add a row to the table above: name, author, license, how it's used.
4. If you ever **copy** code in instead, keep its `LICENSE` in that folder, keep the
   author in its `plugin.json`, and list it in a `THIRD_PARTY_NOTICES.md`.

</details>

---

<div align="center">

My own code here is released under the [MIT License](LICENSE).
Third-party plugins keep their own licenses (see [Credits](#-credits)).

</div>
