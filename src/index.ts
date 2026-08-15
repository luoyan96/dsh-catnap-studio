import type { Context } from '@deepseek-ai/cordis'
import { apply as applySettings, inject as settingsInject } from '@linxin666/dsh-client-ui-web-ui-settings'
import { apply as applyAionPanel, inject as aionPanelInject } from '@linxin666/dsh-client-ui-aionui-panel'
import { apply as applyTaskBoard, inject as taskBoardInject } from '@linxin666/dsh-client-ui-task-board'
import { apply as applyGitGraph, inject as gitGraphInject } from '@linxin666/dsh-client-ui-git-graph'
import { apply as applyLiveStats, inject as liveStatsInject } from '@linxin666/dsh-live-stats'

/** All host-side service requirements needed by the embedded workbench modules. */
export const inject = [...new Set([
  ...settingsInject,
  ...aionPanelInject,
  ...taskBoardInject,
  ...gitGraphInject,
  ...liveStatsInject,
])]

/** Activate the embedded workbench modules from the single Catnap Cordis row. */
export function apply(ctx: Context): void {
  applySettings(ctx as never)
  applyAionPanel(ctx as never)
  applyTaskBoard(ctx as never)
  applyGitGraph(ctx as never)
  applyLiveStats(ctx as never)
}
