import type { Hook, Register } from 'claude-code'

type Engine = Parameters<Hook<'turn.complete'>>[0]

// Sprite-speech voice lines; one is picked at random each time.
// Other sounds in sounds/: sprite-1..4, chime, bell, arpeggio, pop, marimba, retro, whoosh-ding
const VOICES = [1, 2, 3, 4, 5].map(n => `sounds/voice-${n}.wav`)

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)

    // Only the main conversation's turns, and not ones you interrupted.
    if (e.agentId === undefined && !e.isAborted) {
      void chime($).catch(err => $.ui.log(`done-chime: ${String(err)}`, { to: 'debug' }))
    }

    return done
  })
}

async function chime($: Engine) {
  const { platform } = await $.session.info()
  const ASSET = VOICES[Math.floor(Math.random() * VOICES.length)] ?? 'sounds/voice-1.wav'

  if (platform === 'windows') {
    // A Windows terminal has no clip player, so play through .NET's SoundPlayer.
    const path = `${$.plugin.root}/${ASSET}`.replace(/'/g, "''")
    await $.process.run(
      [
        'powershell.exe',
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `(New-Object System.Media.SoundPlayer '${path}').PlaySync()`,
      ],
      { timeoutMs: 10_000 },
    )
    return
  }

  await $.audio.play({ asset: ASSET })
}
