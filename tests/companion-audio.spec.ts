import { describe, expect, it, vi } from 'vitest'
import { CompanionAudio } from '../src/client/companion/audio.ts'

describe('CompanionAudio', () => {
  it('plays only when enabled and cleans up safely', () => {
    const play = vi.fn(() => Promise.resolve())
    const pause = vi.fn()
    const audio = { play, pause, currentTime: 12, volume: 1, preload: '' } as unknown as HTMLAudioElement
    const controller = new CompanionAudio({ source: 'local.wav', enabled: true, volume: 0.2, createAudio: () => audio })
    controller.playPurr()
    expect(play).toHaveBeenCalledTimes(1)
    expect(audio.volume).toBe(0.2)
    controller.configure(false, 0.4)
    controller.playPurr()
    expect(play).toHaveBeenCalledTimes(1)
    controller.dispose()
    expect(pause).toHaveBeenCalledTimes(1)
    expect(audio.currentTime).toBe(0)
  })
})
