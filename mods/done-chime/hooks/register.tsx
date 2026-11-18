import { atom, read, update } from 'claude-code'
import type { Hook, Register } from 'claude-code'

type Engine = Parameters<Hook<'turn.complete'>>[0]
type Sound = { file: string; label: string; hotkey: string }

// Sprite-speech voice lines; one is picked at random when Claude finishes.
const VOICES: Sound[] = [
  { file: 'voice-1', label: '"Hey! All done here."', hotkey: '1' },
  { file: 'voice-2', label: '"Psst... your task is ready."', hotkey: '2' },
  { file: 'voice-3', label: '"Hello again! I finished that for you."', hotkey: '3' },
  { file: 'voice-4', label: '"Ta-da! Take a look when you\'re ready."', hotkey: '4' },
  { file: 'voice-5', label: '"Back to you, partner!"', hotkey: '5' },
]

// Short sprite chirps, then the plain chimes.
const CHIRPS: Sound[] = [
  { file: 'sprite-1', label: 'Sprite 1', hotkey: 'a' },
  { file: 'sprite-2', label: 'Sprite 2', hotkey: 'b' },
  { file: 'sprite-3', label: 'Sprite 3', hotkey: 'c' },
  { file: 'sprite-4', label: 'Sprite 4', hotkey: 'd' },
]

const CHIMES: Sound[] = [
  { file: 'chime', label: 'Chime', hotkey: 'e' },
  { file: 'bell', label: 'Bell', hotkey: 'f' },
  { file: 'arpeggio', label: 'Arpeggio', hotkey: 'g' },
  { file: 'pop', label: 'Pop', hotkey: 'h' },
  { file: 'marimba', label: 'Marimba', hotkey: 'i' },
  { file: 'retro', label: 'Retro', hotkey: 'j' },
  { file: 'whoosh-ding', label: 'Whoosh-ding', hotkey: 'k' },
]

// Sung lines: on the board only, never in the random finish pick.
const SONGS: Sound[] = [
  { file: 'birthday', label: '"Happy Birthday to you!"', hotkey: '6' },
  { file: 'new-year', label: 'New Year · "Auld Lang Syne"', hotkey: '7' },
]

const ALL: Sound[] = [...VOICES, ...SONGS, ...CHIRPS, ...CHIMES]
const randomVoice = () => VOICES[Math.floor(Math.random() * VOICES.length)] ?? VOICES[0]!

const PANE = 'sprite-sounds'
const nowPlaying = atom({ plugin: 'done-chime', key: 'nowPlaying' } as const, null)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'sounds',
      description: 'Open the sprite sound board: play any done-chime sound',
    })

    return next(e)
  })

  on('command.run', { command: 'sounds' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Sprite sounds', focus: true, closeOnEscape: true, rows: 21 })

    return { text: 'Sprite sound board opened.' }
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)

    // Only the main conversation's turns, and not ones you interrupted.
    if (e.agentId === undefined && !e.isAborted) {
      void playFile($, randomVoice().file).catch(err => $.ui.log(`done-chime: ${String(err)}`, { to: 'debug' }))
    }

    return done
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const playing = await read($, nowPlaying)

    const press = (s: Sound) => async () => {
      await update($, nowPlaying, () => s.file)
      try {
        await playFile($, s.file)
      } catch (err) {
        $.ui.log(`done-chime: ${String(err)}`, { to: 'debug' })
      }
      await update($, nowPlaying, cur => (cur === s.file ? null : cur))
    }

    // The first voice line takes the focus ring, so arrows/Tab + Enter work at once.
    const button = (s: Sound, first = false) => (
      <Button
        key={s.file}
        plain
        hotkey={s.hotkey}
        autoFocus={first ? true : undefined}
        dimColor={playing !== null && playing !== s.file}
        onPress={press(s)}
      >
        {playing === s.file ? '♪ ' : ''}
        {s.label}
      </Button>
    )

    const now = ALL.find(s => s.file === playing)

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" justifyContent="space-between">
          <Text bold color="claude">▚▞ Sprite sound board</Text>
          {now ? <Text color="claude">♪ {now.label}</Text> : <Text dimColor>idle</Text>}
        </Box>
        <Text> </Text>

        <Text bold>Voice lines <Text dimColor>· one plays at random when Claude finishes</Text></Text>
        {VOICES.map((s, i) => button(s, i === 0))}
        <Text> </Text>

        <Text bold>Songs</Text>
        {SONGS.map(s => button(s))}
        <Text> </Text>

        <Text bold>Sprite chirps</Text>
        <Box flexDirection="row" flexWrap="wrap" columnGap={3}>{CHIRPS.map(s => button(s))}</Box>
        <Text bold>Chimes</Text>
        <Box flexDirection="row" flexWrap="wrap" columnGap={3}>{CHIMES.map(s => button(s))}</Box>
        <Text> </Text>

        <Box flexDirection="row" columnGap={3}>
          <Button key="random" plain hotkey="r" onPress={() => press(randomVoice())()}>Random voice</Button>
          <Button key="close" plain hotkey="q" role="dismiss" onPress={() => $.ui.close({ id: PANE })}>Close</Button>
        </Box>
        <Text dimColor>↑↓ ←→ / Tab move · Enter play · 1-7, a-k quick play · Esc or q close</Text>
      </Box>
    )
  })
}

async function playFile($: Engine, file: string) {
  const asset = `sounds/${file}.wav`
  const { platform } = await $.session.info()

  if (platform === 'windows') {
    // A Windows terminal has no clip player, so play through .NET's SoundPlayer.
    const path = `${$.plugin.root}/${asset}`.replace(/'/g, "''")
    await $.process.run(
      ['powershell.exe', '-NoProfile', '-NonInteractive', '-Command',
        `(New-Object System.Media.SoundPlayer '${path}').PlaySync()`],
      { timeoutMs: 10_000 },
    )
    return
  }

  await $.audio.play({ asset })
}
