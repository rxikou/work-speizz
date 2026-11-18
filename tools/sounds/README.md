# Sound generators

Plain Python 3 (standard library only) scripts that synthesize done-chime's sounds.
Each takes an output folder; run them from the repo root:

```bash
python tools/sounds/make_sounds.py         mods/done-chime/sounds   # chime, bell, arpeggio, pop, marimba, retro, whoosh-ding
python tools/sounds/make_sprite_chimes.py  mods/done-chime/sounds   # sprite-1..4: soft three-note pixel chimes
python tools/sounds/make_voice_chimes.py   mods/done-chime/sounds   # voice-1..5, birthday, new-year: lines as syllable blips
```

To make a new voice line, add an entry to `LINES` in `make_voice_chimes.py`: one
`(semitones from C5, seconds, glide)` tuple per syllable, `"pause"` for a breath,
and `(None, seconds, 0)` for a soft "psst".
