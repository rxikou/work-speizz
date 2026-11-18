import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'done-chime',
  component: 'Pane',
  requestId: 'sprite-sounds',
  props: {
    title: 'Sprite sounds',
    isFocused: true,
    bodyColumns: 80,
    placement: 'inline',
    scroll: { offset: 0, bodyRows: 14 },
    view: {},
  },
} as const

test('the board lists every sound and a press plays it', async ($, on) => {
  const played: string[] = []
  on('session.info', () => ({ value: { platform: 'macos', isHosted: false } as never }))
  on('audio.play', (_, e) => {
    if (e.clip.asset) played.push(e.clip.asset)

    return { value: undefined }
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })

  expect(await ui.find({ type: 'Button', key: 'voice-1' })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 'whoosh-ding' })).toBeDefined()

  await ui.press({ key: 'voice-3' })
  await ui.press({ key: 'bell' })

  expect(played).toEqual(['sounds/voice-3.wav', 'sounds/bell.wav'])
  await ui.unmount()
})

test('a finished main turn plays one voice line; a subagent turn plays none', async ($, on) => {
  const played: string[] = []
  on('session.info', () => ({ value: { platform: 'macos', isHosted: false } as never }))
  on('audio.play', (_, e) => {
    if (e.clip.asset) played.push(e.clip.asset)

    return { value: undefined }
  })
  on('turn.complete', (_, e) => ({ text: e.answer }))

  const base = { answer: 'ok', durationMs: 10, isAborted: false, turnId: 't1', reason: 'completed' } as const
  await $.turn.complete({ ...base, agentId: 'sub-1' } as never)
  await $.turn.complete(base as never)
  for (let i = 0; i < 20; i++) await Promise.resolve()

  expect(played.length).toBe(1)
  expect(played[0]).toMatch(/^sounds\/voice-[1-5]\.wav$/)
})
