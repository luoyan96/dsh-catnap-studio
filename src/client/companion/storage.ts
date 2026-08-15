import type { CompanionPreferences } from './types.ts'

export const COMPANION_STORAGE_KEY = 'dsh-catnap-companion'

export const DEFAULT_COMPANION_PREFERENCES: CompanionPreferences = {
  name: '团团',
  hidden: false,
  soundEnabled: true,
  volume: 0.18,
  autonomousActivity: true,
}

function finiteCoordinate(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function readCompanionPreferences(
  storage: Pick<Storage, 'getItem'> = localStorage,
): CompanionPreferences {
  try {
    const raw = storage.getItem(COMPANION_STORAGE_KEY)
    if (raw === null) return { ...DEFAULT_COMPANION_PREFERENCES }
    const value = JSON.parse(raw) as Record<string, unknown>
    return {
      name: typeof value.name === 'string' && value.name.trim() !== ''
        ? value.name.trim().slice(0, 18)
        : DEFAULT_COMPANION_PREFERENCES.name,
      hidden: typeof value.hidden === 'boolean' ? value.hidden : false,
      x: finiteCoordinate(value.x),
      y: finiteCoordinate(value.y),
      soundEnabled: typeof value.soundEnabled === 'boolean' ? value.soundEnabled : true,
      volume: typeof value.volume === 'number' && Number.isFinite(value.volume)
        ? Math.min(1, Math.max(0, value.volume))
        : DEFAULT_COMPANION_PREFERENCES.volume,
      autonomousActivity: typeof value.autonomousActivity === 'boolean'
        ? value.autonomousActivity
        : true,
    }
  } catch {
    return { ...DEFAULT_COMPANION_PREFERENCES }
  }
}

export function storeCompanionPreferences(
  preferences: CompanionPreferences,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  try {
    storage.setItem(COMPANION_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Companion preferences are optional enhancement state; storage failure is harmless.
  }
}
