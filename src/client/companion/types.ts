export type CompanionState =
  | 'resting'
  | 'sleeping'
  | 'stretching'
  | 'playing-yarn'
  | 'petted'
  | 'paused'

export interface CompanionPreferences {
  name: string
  hidden: boolean
  x?: number
  y?: number
  soundEnabled: boolean
  volume: number
  autonomousActivity: boolean
}

export interface CompanionThemeAssets {
  resting: string
  sleeping: string
  stretching: string
  playingYarn: string
  petted: string
  bed: string
}
