# work-speizz
My personal Claude Code arsenal of configs and workflow mods.

One repo to make any machine, and any project, feel like home: my Claude Code
settings, plus small mods that make the day-to-day smoother.

## What's inside

| Path | What it is |
| --- | --- |
| [`mods/`](mods/) | Claude Code mods, each a self-contained plugin |
| [`setup/settings.json`](setup/settings.json) | My baseline Claude Code settings |
| [`scripts/`](scripts/) | One-shot installers for Windows and macOS/Linux |
| [`tools/sounds/`](tools/sounds/) | Generators for the mods' (original, synthesized) sounds |
| [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) | Makes this repo a plugin marketplace |

### Mods

| Mod | Does |
| --- | --- |
| [done-chime](mods/done-chime/) | A soft pixel "sprite" chirps a random voice line whenever Claude finishes a task |

### Settings highlights

- No `Co-Authored-By: Claude` line on commits.
- Claude may not open or merge pull requests (`gh pr create` / `gh pr merge` are denied).
- Opus at high effort, the [ECC](https://github.com/affaan-m/ECC) plugin, dark daltonized theme, notifications on.

## Set up a machine

```
git clone https://github.com/rxikou/work-speizz.git
cd work-speizz

# Windows
powershell -ExecutionPolicy Bypass -File scripts\install.ps1

# macOS / Linux / WSL
bash scripts/install.sh
```

The script backs up `~/.claude/settings.json`, merges `setup/settings.json` into it
(keeping anything else you have), then installs every mod listed in the
marketplace. Use `-SkipSettings` / `-SkipMods` (or `--skip-settings` /
`--skip-mods`) to do just one half.

## Install a single mod

At a Claude Code prompt:

```
/plugin install done-chime --marketplace rxikou/work-speizz
```

Answer `y` to add the marketplace, then pick a scope.

## Add a new mod

1. Put it in `mods/<name>/` with its `.claude-plugin/plugin.json`.
2. Add `{ "name": "<name>", "source": "./mods/<name>" }` to `plugins` in
   `.claude-plugin/marketplace.json`.
3. Check it: `claude plugin validate mods/<name>`.

## License

[MIT](LICENSE)
