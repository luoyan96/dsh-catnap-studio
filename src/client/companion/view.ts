import type { CompanionState, CompanionThemeAssets } from './types.ts'

export function assetForState(assets: CompanionThemeAssets, state: CompanionState): string {
  if (state === 'sleeping') return assets.sleeping
  if (state === 'stretching') return assets.stretching
  if (state === 'playing-yarn') return assets.playingYarn
  if (state === 'petted') return assets.petted
  return assets.resting
}

export function stateLabel(state: CompanionState): string {
  const labels: Record<CompanionState, string> = {
    resting: '安静陪伴',
    sleeping: '打盹中',
    stretching: '伸个懒腰',
    'playing-yarn': '玩毛线球',
    petted: '舒服得眯起眼睛',
    paused: '暂时安静下来',
  }
  return labels[state]
}
