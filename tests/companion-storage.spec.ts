import { describe, expect, it, vi } from 'vitest'
import { readCompanionPreferences, storeCompanionPreferences } from '../src/client/companion/storage.ts'

describe('companion preference storage', () => {
  it('migrates the old affinity/treats object without losing position or visibility', () => {
    const storage = {
      getItem: vi.fn(() => JSON.stringify({ name: 'Mochi', affinity: 80, treats: 4, hidden: true, x: 32, y: 48 })),
    }
    expect(readCompanionPreferences(storage)).toEqual({
      name: 'Mochi', hidden: true, x: 32, y: 48, soundEnabled: true, volume: 0.18, autonomousActivity: true,
    })
  })

  it('clamps volume and tolerates malformed storage', () => {
    expect(readCompanionPreferences({ getItem: () => '{' })).toMatchObject({ name: '团团', volume: 0.18 })
    expect(readCompanionPreferences({ getItem: () => JSON.stringify({ volume: 9 }) }).volume).toBe(1)
    expect(() => storeCompanionPreferences(readCompanionPreferences({ getItem: () => null }), {
      setItem: () => { throw new Error('blocked') },
    })).not.toThrow()
  })
})
