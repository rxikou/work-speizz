export type NowPlaying = string | null

declare module 'claude-code' {
  interface PluginState {
    'done-chime': { nowPlaying: NowPlaying }
  }
}
