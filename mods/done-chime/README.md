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

All sounds are original, synthesized by the scripts in `tools/sounds/`, and tuned
to be gentle: low-passed, quiet, with slow note fade-ins.

## Install

```
/plugin install done-chime --marketplace rxikou/work-speizz
```

Answer `y` to add the marketplace, then pick a scope.

## Platforms

- **Windows**: played through PowerShell's `System.Media.SoundPlayer`.
- **macOS**: played by Claude Code's own player (`afplay`).
- **Linux**: Claude Code's terminal has no clip player there, so it stays silent.

## Changing the sound

Other clips live in `sounds/` (`sprite-1..4`, `chime`, `bell`, `arpeggio`, `pop`,
`marimba`, `retro`, `whoosh-ding`). Edit `VOICES` in `hooks/register.ts` to choose
which ones it picks from.
