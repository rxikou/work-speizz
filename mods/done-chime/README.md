# done-chime

A tiny pixel "Claude sprite" talks to you when Claude finishes a task.

Each time a turn of the main conversation ends (not subagents, not when you
interrupt), the mod plays one of five soft **sprite-speech** clips at random. Each
clip is a voice line turned into chiptune blips, one per syllable:

| Clip | Line |
| --- | --- |
| `voice-1` | "Hey! All done here." |
| `voice-2` | "Psst... your task is ready." |
| `voice-3` | "Hello again! I finished that for you." |
| `voice-4` | "Ta-da! Take a look when you're ready." |
| `voice-5` | "Back to you, partner!" |

All sounds are original, synthesized by the scripts in [`tools/sounds/`](../../tools/sounds/) (kept out of the mod, so installs don't download them), and tuned
to be gentle: low-passed, quiet, with slow note fade-ins.

## Install

See the [repo's Quick Setup](../../README.md#quick-setup), or run:

```bash
claude plugin install done-chime --marketplace rxikou/work-speizz
```

## Platforms

- **Windows**: played through PowerShell's `System.Media.SoundPlayer`.
- **macOS**: played by Claude Code's own player (`afplay`).
- **Linux**: Claude Code's terminal has no clip player there, so it stays silent.

## Sound board

Type `/sounds` to open an inline panel listing every sound, grouped into voice
lines, songs, sprite chirps and chimes.

| Key | Does |
| --- | --- |
| `↑` `↓` `←` `→` / `Tab` | Move between sounds (the first voice line starts selected) |
| `Enter` | Play the selected sound |
| `1`–`5` | Play a voice line straight away |
| `6`–`7` | Play a song ("Happy Birthday", "Auld Lang Syne") |
| `a`–`k` | Play a chirp or chime straight away |
| `r` | Play a random voice line |
| `q` / `Esc` | Close the panel |

You can also click any sound. While a clip plays, its name shows at the top right with
`♪` and the other sounds dim.

## Changing the sound

Other clips live in `sounds/` (`birthday`, `new-year`, `sprite-1..4`, `chime`, `bell`, `arpeggio`, `pop`,
`marimba`, `retro`, `whoosh-ding`). Edit `VOICES` in `hooks/register.tsx` to choose
which ones it picks from.
