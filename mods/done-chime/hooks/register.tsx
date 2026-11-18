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

const OTHERS: Sound[] = [
  'sprite-1', 'sprite-2', 'sprite-3', 'sprite-4', 'chime', 'bell',
  'arpeggio', 'pop', 'marimba', 'retro', 'whoosh-ding',
].map((file, i) => ({ file, label: file, hotkey: 'abcdefghijk'[i] ?? 'a' }))

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
    await $.ui.open({ id: PANE, title: 'Sprite sounds', focus: true, closeOnEscape: true, rows: 14 })

    return { text: 'Sprite sound board opened.' }
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)

    // Only the main conversation's turns, and not ones you interrupted.
    if (e.agentId === undefined && !e.isAborted) {
      const pick = VOICES[Math.floor(Math.random() * VOICES.length)] ?? VOICES[0]
      if (pick) void playFile($, pick.file).catch(err => $.ui.log(`done-chime: ${String(err)}`, { to: 'debug' }))
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

    const row = (s: Sound) => (
      <Button key={s.file} plain hotkey={s.hotkey} onPress={press(s)}>
        {playing === s.file ? '▶ ' : '  '}
        {s.label}
      </Button>
    )

    return (
      <Box flexDirection="column">
        <Text bold>Voice lines <Text dimColor>(one plays at random when Claude finishes)</Text></Text>
        {VOICES.map(row)}
        <Text> </Text>
        <Text bold>Other sounds</Text>
        <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
          {OTHERS.map(row)}
        </Box>
        <Text> </Text>
        <Text dimColor>Press a key or click to play · Esc closes</Text>
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
