/**
 * Catnap Studio combines five DSH workbench modules with the original theme,
 * studio center, and companion experience.
 */
import type { Context } from '@deepseek-ai/cordis'
import '@linxin666/dsh-client-ui-web-ui-settings/client'
import '@linxin666/dsh-client-ui-aionui-panel/client'
import '@linxin666/dsh-client-ui-task-board/client'
import '@linxin666/dsh-client-ui-git-graph/client'
import '@linxin666/dsh-live-stats/client'
import css from './catnap.module.css'
import { CompanionAudio } from './companion/audio.ts'
import { CompanionScheduler } from './companion/scheduler.ts'
import { CompanionStateMachine } from './companion/state-machine.ts'
import { readCompanionPreferences, storeCompanionPreferences } from './companion/storage.ts'
import type { CompanionThemeAssets } from './companion/types.ts'
import { assetForState, stateLabel } from './companion/view.ts'
import { THEME_ASSETS } from './generated/theme-assets.ts'

type ThemeId = 'warm' | 'moonlit' | 'atelier'

interface ThemeDefinition {
  label: string
  title: string
  description: string
  status: readonly string[]
  mascot: string
  companion?: string
  texture: string
  workCompanion: CompanionThemeAssets
}

interface FeatureDefinition {
  name: string
  description: string
}

const STORAGE_KEY = 'dsh-catnap-theme'
const FEATURE_CLIENT_IDS = [
  '@linxin666/dsh-client-ui-web-ui-settings',
  '@linxin666/dsh-client-ui-aionui-panel',
  '@linxin666/dsh-client-ui-task-board',
  '@linxin666/dsh-client-ui-git-graph',
  '@linxin666/dsh-live-stats',
] as const
const THEME_IDS: readonly ThemeId[] = ['warm', 'moonlit', 'atelier']
const FEATURES: readonly FeatureDefinition[] = [
  { name: '任务看板', description: '按状态组织任务、打开详情并支持定时执行。' },
  { name: 'Git 图谱', description: '切换分支、查看提交历史与仓库状态。' },
  { name: '文件与预览', description: '在右侧面板浏览、预览和管理工作区文件。' },
  { name: '实时统计', description: '在输入区查看 TPS、上下文、缓存和令牌用量。' },
  { name: '插件设置', description: '在 DSH 设置中心统一管理工作台功能。' },
]
const THEMES: Record<ThemeId, ThemeDefinition> = {
  warm: {
    label: '暖纸猫窝',
    title: '暖纸猫窝 · DeepSeek Harness',
    description: '奶油纸张、杏橙控件与趴在输入框旁的橘猫。',
    status: ['CATNAP', '就绪', '猫咪在线', '暖灯已开'],
    mascot: THEME_ASSETS.warmCat,
    texture: THEME_ASSETS.warmTexture,
    workCompanion: {
      resting: THEME_ASSETS.warmCompanionResting,
      sleeping: THEME_ASSETS.warmCompanionSleeping,
      stretching: THEME_ASSETS.warmCompanionStretching,
      playingYarn: THEME_ASSETS.warmCompanionPlayingYarn,
      petted: THEME_ASSETS.warmCompanionPetted,
      bed: THEME_ASSETS.warmCompanionBed,
    },
  },
  moonlit: {
    label: '月夜守护',
    title: '月夜守护 · DeepSeek Harness',
    description: '深靛夜色、金色星点与守夜猫咪。',
    status: ['MOONLIT', '夜间专注', '猫咪守夜', '暖灯已开'],
    mascot: THEME_ASSETS.moonlitLantern,
    companion: THEME_ASSETS.moonlitGuardian,
    texture: THEME_ASSETS.moonlitTexture,
    workCompanion: {
      resting: THEME_ASSETS.moonlitCompanionResting,
      sleeping: THEME_ASSETS.moonlitCompanionSleeping,
      stretching: THEME_ASSETS.moonlitCompanionStretching,
      playingYarn: THEME_ASSETS.moonlitCompanionPlayingYarn,
      petted: THEME_ASSETS.moonlitCompanionPetted,
      bed: THEME_ASSETS.moonlitCompanionBed,
    },
  },
  atelier: {
    label: '猫咪工坊',
    title: '猫咪工坊 · DeepSeek Harness',
    description: '再生纸、协作标记与探头的奶牛猫。',
    status: ['ATELIER', '就绪', '猫咪协作中', '灵感在线'],
    mascot: THEME_ASSETS.atelierTuxedo,
    texture: THEME_ASSETS.atelierTexture,
    workCompanion: {
      resting: THEME_ASSETS.atelierCompanionResting,
      sleeping: THEME_ASSETS.atelierCompanionSleeping,
      stretching: THEME_ASSETS.atelierCompanionStretching,
      playingYarn: THEME_ASSETS.atelierCompanionPlayingYarn,
      petted: THEME_ASSETS.atelierCompanionPetted,
      bed: THEME_ASSETS.atelierCompanionBed,
    },
  },
}

interface FeatureClientModule {
  apply?: (ctx: Context) => void
}

interface ClientModuleSystem {
  import: (id: string) => Promise<unknown>
}

declare global {
  // DSH installs this module system before materializing plugin factories.
  var __DSH_MODULES__: ClientModuleSystem | undefined
}

/** Cordis services required by the five embedded browser modules. */
export const inject = [
  'slots',
  'locale',
  'connection',
  'settingsScope',
  'remote',
  'sessions',
  'workspaces',
]

function activateFeatureClients(ctx: Context): void {
  const modules = globalThis.__DSH_MODULES__
  if (modules === undefined) return
  void Promise.all(FEATURE_CLIENT_IDS.map(id => modules.import(id))).then((features) => {
    for (const feature of features) {
      const candidate = feature as FeatureClientModule
      candidate.apply?.(ctx)
    }
  }).catch((error: unknown) => {
    console.error('Catnap Studio could not activate its workbench modules.', error)
  })
}

const cls = (name: keyof typeof css): string => css[name] ?? ''

function isThemeId(value: string | null): value is ThemeId {
  return value !== null && THEME_IDS.includes(value as ThemeId)
}

function readStoredTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isThemeId(stored) ? stored : 'warm'
  } catch {
    return 'warm'
  }
}

function storeTheme(theme: ThemeId): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // A blocked storage area should never prevent visual theme switching.
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function findComposer(): DOMRect | undefined {
  return Array.from(document.querySelectorAll('textarea'))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width >= 320 && rect.height >= 48)
    .sort((left, right) => right.width - left.width)[0]
}

function isComposerOverlayOpen(): boolean {
  const composer = findComposer()
  if (composer === undefined) return false

  return Array.from(document.querySelectorAll<HTMLElement>('[aria-haspopup][aria-expanded="true"]')).some((trigger) => {
    const rect = trigger.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false

    const isNearComposer = rect.right >= composer.left
      && rect.left <= composer.right
      && rect.bottom >= composer.top - 64
      && rect.top <= composer.bottom + 56
    if (!isNearComposer) return false

    const controlledId = trigger.getAttribute('aria-controls')
    if (controlledId === null) return true
    const controlled = document.getElementById(controlledId)
    return controlled === null || !controlled.hasAttribute('hidden')
  })
}

function positionDecor(theme: ThemeId, mascot: HTMLImageElement, companion: HTMLImageElement): void {
  const composer = findComposer()
  if (composer === undefined || window.innerWidth < 860) {
    mascot.hidden = true
    companion.hidden = true
    return
  }

  companion.hidden = true
  mascot.hidden = false

  if (theme === 'warm') {
    const width = Math.min(270, Math.max(190, composer.width * 0.26))
    mascot.style.width = `${Math.round(width)}px`
    mascot.style.left = `${Math.round(composer.right - width - 28)}px`
    mascot.style.top = `${Math.round(Math.max(48, composer.top - width * 0.31))}px`
    return
  }

  if (theme === 'moonlit') {
    const sidebar = document.querySelector('[data-pane="sidebar"]')?.getBoundingClientRect()
    if (sidebar !== undefined && sidebar.width >= 240) {
      mascot.hidden = false
      mascot.style.width = '94px'
      mascot.style.left = `${Math.round(sidebar.right + 142)}px`
      mascot.style.top = '58px'
      companion.hidden = false
      companion.style.width = '102px'
      companion.style.left = `${Math.round(sidebar.right + 22)}px`
      companion.style.top = '54px'
    } else {
      mascot.hidden = true
      companion.hidden = true
    }
    return
  }

  const width = 154
  mascot.style.width = `${width}px`
  mascot.style.left = `${Math.round(Math.min(window.innerWidth - width - 12, composer.right - width * 0.42))}px`
  mascot.style.top = `${Math.round(Math.max(48, composer.top - width * 1.08))}px`
}

/** Apply Catnap Studio and register a disposer for every owned DOM write. */
export function apply(ctx: Context): void {
  const body = document.body
  const ownedPaneMarkers = new Map<HTMLElement, string | null>()
  const ensureHostPaneMarkers = (): void => {
    const panes = [
      ['sidebar', 'sidebar'],
      ['conversation', 'conversation'],
      ['details', 'details'],
    ] as const
    for (const [slotName, paneName] of panes) {
      const slot = document.querySelector<HTMLElement>(`[data-slot="${slotName}"]`)
      const pane = slot?.parentElement
      if (pane === null || pane === undefined) continue
      if (!ownedPaneMarkers.has(pane)) ownedPaneMarkers.set(pane, pane.getAttribute('data-pane'))
      pane.dataset.pane = paneName
    }
  }
  ensureHostPaneMarkers()
  activateFeatureClients(ctx)
  const desktopMode = new URLSearchParams(window.location.search).get('catnap-desktop') === '1'
  const displayTitle = (definition: ThemeDefinition): string => desktopMode
    ? `Catnap Desktop · ${definition.label}`
    : definition.title
  const originalTitle = document.title
  const originalBodyMarker = body.getAttribute('data-dsh-catnap')
  const originalTheme = body.getAttribute('data-catnap-theme')
  const originalSettingsOpen = body.getAttribute('data-catnap-settings-open')
  const originalComposerOverlayOpen = body.getAttribute('data-catnap-composer-overlay-open')
  const originalTexture = body.style.getPropertyValue('--catnap-texture')
  const originalTexturePriority = body.style.getPropertyPriority('--catnap-texture')
  const originalHero = body.style.getPropertyValue('--catnap-hero-art')
  const originalHeroPriority = body.style.getPropertyPriority('--catnap-hero-art')
  let activeTheme = readStoredTheme()
  let activeSkinTitle = displayTitle(THEMES[activeTheme])
  const companionState = readCompanionPreferences(window.localStorage)
  const companionMachine = new CompanionStateMachine()
  const previewState = desktopMode
    ? new URLSearchParams(window.location.search).get('catnap-companion-state')
    : null
  const applyPreviewState = (): void => {
    if (previewState === 'sleeping' || previewState === 'stretching' || previewState === 'playing-yarn') {
      companionMachine.setAutonomous(previewState)
    } else if (previewState === 'petted') {
      companionMachine.pet()
    }
  }
  applyPreviewState()
  const reducedMotionQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : undefined
  const companionScheduler = new CompanionScheduler({
    machine: companionMachine,
    autonomousActivity: companionState.autonomousActivity,
    reducedMotion: reducedMotionQuery?.matches ?? false,
  })
  const companionAudio = new CompanionAudio({
    source: THEME_ASSETS.companionPurr,
    enabled: companionState.soundEnabled,
    volume: companionState.volume,
  })
  const pauseReasons = new Set<string>()
  let repositionFrame: number | undefined
  let petBubbleTimer: number | undefined
  let composerOverlayTimer: number | undefined
  let activeStudioTab = 'themes'
  let draggingPet = false
  let petDragOrigin: { pointerX: number; pointerY: number; left: number; top: number } | undefined

  body.dataset.dshCatnap = ''

  const titlebar = document.createElement('div')
  titlebar.className = cls('titlebar')
  titlebar.dataset.skinChrome = 'titlebar'
  const titlebarIcon = document.createElement('img')
  titlebarIcon.className = cls('titlebarIcon')
  titlebarIcon.alt = ''
  titlebarIcon.setAttribute('aria-hidden', 'true')
  const titlebarTitle = document.createElement('span')
  titlebarTitle.className = cls('titlebarTitle')
  titlebar.append(titlebarIcon, titlebarTitle)

  const statusbar = document.createElement('div')
  statusbar.className = cls('statusbar')
  statusbar.dataset.skinChrome = 'statusbar'
  statusbar.setAttribute('aria-live', 'polite')
  const statusLabel = document.createElement('span')
  statusLabel.className = cls('statusLabel')
  statusLabel.textContent = 'Catnap Studio'
  const spacer = document.createElement('span')
  spacer.className = cls('statusbarSpacer')

  const selector = document.createElement('button')
  selector.type = 'button'
  selector.className = cls('themeSelector')
  selector.dataset.skinChrome = 'theme-selector'
  selector.setAttribute('aria-label', '选择猫咪主题')
  selector.setAttribute('aria-haspopup', 'menu')
  selector.setAttribute('aria-expanded', 'false')

  const menu = document.createElement('div')
  menu.className = cls('themeMenu')
  menu.dataset.skinChrome = 'theme-menu'
  menu.setAttribute('role', 'menu')
  menu.setAttribute('aria-label', '猫咪主题')
  menu.hidden = true

  const options = new Map<ThemeId, HTMLButtonElement>()
  for (const id of THEME_IDS) {
    const option = document.createElement('button')
    option.type = 'button'
    option.className = cls('themeOption')
    option.dataset.themeOption = id
    option.setAttribute('role', 'menuitemradio')
    option.setAttribute('aria-checked', 'false')
    const name = document.createElement('strong')
    name.textContent = THEMES[id].label
    const description = document.createElement('small')
    description.textContent = id === 'warm'
      ? '奶油纸张与睡觉橘猫'
      : id === 'moonlit'
        ? '靛蓝夜色与守夜猫咪'
        : '再生纸与协作奶牛猫'
    option.append(name, description)
    options.set(id, option)
    menu.append(option)
  }

  const statusCells = THEMES.warm.status.map(() => {
    const cell = document.createElement('span')
    cell.className = cls('statusbarCell')
    statusbar.append(cell)
    return cell
  })
  const studioButton = document.createElement('button')
  studioButton.type = 'button'
  studioButton.className = cls('studioButton')
  studioButton.dataset.skinChrome = 'studio-button'
  studioButton.setAttribute('aria-label', '打开猫咪伙伴面板')
  studioButton.setAttribute('aria-expanded', 'false')
  const studioButtonImage = document.createElement('img')
  studioButtonImage.alt = ''
  studioButtonImage.setAttribute('aria-hidden', 'true')
  const studioButtonLabel = document.createElement('span')
  studioButtonLabel.textContent = '猫窝'
  studioButton.append(studioButtonImage, studioButtonLabel)

  statusbar.prepend(statusLabel, spacer, studioButton, selector, menu)

  const mascot = document.createElement('img')
  mascot.className = cls('mascot')
  mascot.dataset.skinChrome = 'mascot'
  mascot.alt = ''
  mascot.setAttribute('aria-hidden', 'true')

  const companion = document.createElement('img')
  companion.className = cls('companion')
  companion.dataset.skinChrome = 'companion'
  companion.alt = ''
  companion.hidden = true
  companion.setAttribute('aria-hidden', 'true')

  const petButton = document.createElement('button')
  petButton.type = 'button'
  petButton.className = cls('petButton')
  petButton.dataset.skinChrome = 'cat-companion'
  petButton.setAttribute('aria-label', '抚摸猫咪伙伴')
  const petImage = document.createElement('img')
  petImage.alt = ''
  petImage.draggable = false
  petImage.setAttribute('aria-hidden', 'true')
  const petBubble = document.createElement('span')
  petBubble.className = cls('petBubble')
  petBubble.textContent = '呼噜……'
  petButton.append(petBubble, petImage)

  const studioBackdrop = document.createElement('div')
  studioBackdrop.className = cls('studioBackdrop')
  studioBackdrop.dataset.skinChrome = 'studio-backdrop'
  studioBackdrop.hidden = true

  const studioPanel = document.createElement('section')
  studioPanel.className = cls('studioPanel')
  studioPanel.setAttribute('role', 'dialog')
  studioPanel.setAttribute('aria-modal', 'true')
  studioPanel.setAttribute('aria-labelledby', 'catnap-studio-title')

  const studioHeader = document.createElement('header')
  studioHeader.className = cls('studioHeader')
  const studioHeaderArt = document.createElement('img')
  studioHeaderArt.alt = ''
  studioHeaderArt.setAttribute('aria-hidden', 'true')
  const studioHeading = document.createElement('div')
  const studioEyebrow = document.createElement('small')
  studioEyebrow.textContent = 'CATNAP STUDIO'
  const studioTitle = document.createElement('h2')
  studioTitle.id = 'catnap-studio-title'
  studioTitle.textContent = '猫窝工作台'
  const studioSubtitle = document.createElement('p')
  studioSubtitle.textContent = '主题、伙伴与工作能力都收在这里。'
  studioHeading.append(studioEyebrow, studioTitle, studioSubtitle)
  const studioClose = document.createElement('button')
  studioClose.type = 'button'
  studioClose.className = cls('studioClose')
  studioClose.dataset.studioAction = 'close'
  studioClose.textContent = '关闭'
  studioHeader.append(studioHeaderArt, studioHeading, studioClose)

  const tabList = document.createElement('div')
  tabList.className = cls('studioTabs')
  tabList.setAttribute('role', 'tablist')
  tabList.setAttribute('aria-label', '猫窝中心栏目')
  const panelContainer = document.createElement('div')
  panelContainer.className = cls('studioContent')
  const tabButtons = new Map<string, HTMLButtonElement>()
  const tabPanels = new Map<string, HTMLElement>()
  const createTab = (id: string, label: string): HTMLElement => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = cls('studioTab')
    button.dataset.studioTab = id
    button.setAttribute('role', 'tab')
    button.setAttribute('aria-selected', 'false')
    button.textContent = label
    const panel = document.createElement('div')
    panel.className = cls('studioTabPanel')
    panel.dataset.studioPanel = id
    panel.setAttribute('role', 'tabpanel')
    panel.hidden = true
    tabButtons.set(id, button)
    tabPanels.set(id, panel)
    tabList.append(button)
    panelContainer.append(panel)
    return panel
  }

  const themesPanel = createTab('themes', '主题衣橱')
  const themeIntro = document.createElement('div')
  themeIntro.className = cls('sectionIntro')
  themeIntro.innerHTML = '<strong>三套猫咪场景</strong><span>先试穿，喜欢就留下；选择会自动记住。</span>'
  const themeGrid = document.createElement('div')
  themeGrid.className = cls('themeGrid')
  const themeCards = new Map<ThemeId, HTMLButtonElement>()
  for (const id of THEME_IDS) {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = cls('themeCard')
    card.dataset.studioTheme = id
    card.setAttribute('aria-pressed', 'false')
    const visual = document.createElement('span')
    visual.className = cls('themeCardVisual')
    const art = document.createElement('img')
    art.alt = ''
    art.setAttribute('aria-hidden', 'true')
    art.src = THEMES[id].mascot
    visual.style.backgroundImage = `url("${THEMES[id].texture}")`
    visual.append(art)
    const copy = document.createElement('span')
    copy.className = cls('themeCardCopy')
    const name = document.createElement('strong')
    name.textContent = THEMES[id].label
    const description = document.createElement('small')
    description.textContent = THEMES[id].description
    const state = document.createElement('span')
    state.className = cls('themeCardState')
    state.textContent = '试穿'
    copy.append(name, description, state)
    card.append(visual, copy)
    themeCards.set(id, card)
    themeGrid.append(card)
  }
  themesPanel.append(themeIntro, themeGrid)

  const settingsThemeBlock = document.createElement('section')
  settingsThemeBlock.className = cls('settingsThemeBlock')
  settingsThemeBlock.dataset.skinChrome = 'settings-appearance'
  const settingsThemeHeader = document.createElement('div')
  settingsThemeHeader.className = cls('settingsThemeHeader')
  const settingsThemeHeading = document.createElement('strong')
  settingsThemeHeading.textContent = '猫咪主题'
  const settingsThemeDescription = document.createElement('span')
  settingsThemeDescription.textContent = '选择 Catnap Studio 场景；设置打开时会暂时收起桌面猫咪。'
  settingsThemeHeader.append(settingsThemeHeading, settingsThemeDescription)
  const settingsThemeGrid = document.createElement('div')
  settingsThemeGrid.className = cls('settingsThemeGrid')
  const settingsThemeCards = new Map<ThemeId, HTMLButtonElement>()
  for (const id of THEME_IDS) {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = cls('settingsThemeCard')
    card.dataset.settingsTheme = id
    card.setAttribute('aria-pressed', 'false')
    const art = document.createElement('img')
    art.alt = ''
    art.setAttribute('aria-hidden', 'true')
    art.src = THEMES[id].mascot
    const copy = document.createElement('span')
    copy.className = cls('settingsThemeCopy')
    const name = document.createElement('strong')
    name.textContent = THEMES[id].label
    const description = document.createElement('small')
    description.textContent = THEMES[id].description
    const state = document.createElement('span')
    state.className = cls('settingsThemeState')
    state.textContent = '使用'
    copy.append(name, description, state)
    card.append(art, copy)
    settingsThemeCards.set(id, card)
    settingsThemeGrid.append(card)
  }
  const settingsStudioButton = document.createElement('button')
  settingsStudioButton.type = 'button'
  settingsStudioButton.className = cls('settingsStudioButton')
  settingsStudioButton.textContent = '管理猫咪伙伴与工作能力'
  settingsThemeBlock.append(settingsThemeHeader, settingsThemeGrid, settingsStudioButton)

  const companionPanel = createTab('companion', '猫咪伙伴')
  const companionCard = document.createElement('div')
  companionCard.className = cls('companionCard')
  const companionPortrait = document.createElement('img')
  companionPortrait.alt = ''
  companionPortrait.setAttribute('aria-hidden', 'true')
  const companionCopy = document.createElement('div')
  const companionName = document.createElement('strong')
  const companionMood = document.createElement('span')
  const companionMeta = document.createElement('small')
  companionCopy.append(companionName, companionMood, companionMeta)
  companionCard.append(companionPortrait, companionCopy)
  const companionActions = document.createElement('div')
  companionActions.className = cls('companionActions')
  const petAction = document.createElement('button')
  petAction.type = 'button'
  petAction.dataset.companionAction = 'pet'
  petAction.textContent = '摸摸它'
  const visibilityAction = document.createElement('button')
  visibilityAction.type = 'button'
  visibilityAction.dataset.companionAction = 'visibility'
  companionActions.append(petAction, visibilityAction)
  const companionPreferences = document.createElement('div')
  companionPreferences.className = cls('companionPreferences')
  const soundLabel = document.createElement('label')
  const soundToggle = document.createElement('input')
  soundToggle.type = 'checkbox'
  soundToggle.dataset.companionField = 'sound'
  soundLabel.append(soundToggle, document.createTextNode(' 抚摸音效'))
  const volumeLabel = document.createElement('label')
  volumeLabel.textContent = '音量 '
  const volumeInput = document.createElement('input')
  volumeInput.type = 'range'
  volumeInput.min = '0'
  volumeInput.max = '100'
  volumeInput.step = '1'
  volumeInput.dataset.companionField = 'volume'
  volumeLabel.append(volumeInput)
  const autonomousLabel = document.createElement('label')
  const autonomousToggle = document.createElement('input')
  autonomousToggle.type = 'checkbox'
  autonomousToggle.dataset.companionField = 'autonomous'
  autonomousLabel.append(autonomousToggle, document.createTextNode(' 自主活动'))
  companionPreferences.append(soundLabel, volumeLabel, autonomousLabel)
  const renameRow = document.createElement('div')
  renameRow.className = cls('renameRow')
  const renameInput = document.createElement('input')
  renameInput.type = 'text'
  renameInput.maxLength = 18
  renameInput.dataset.companionField = 'name'
  renameInput.setAttribute('aria-label', '猫咪名字')
  const renameAction = document.createElement('button')
  renameAction.type = 'button'
  renameAction.dataset.companionAction = 'rename'
  renameAction.textContent = '保存名字'
  renameRow.append(renameInput, renameAction)
  const dragHint = document.createElement('p')
  dragHint.className = cls('dragHint')
  dragHint.textContent = '轻点或按 Enter 抚摸；拖动超过 5px 才会移动并记住位置。'
  companionPanel.append(companionCard, companionActions, companionPreferences, renameRow, dragHint)

  const featuresPanel = createTab('features', '工作能力')
  const featureIntro = document.createElement('div')
  featureIntro.className = cls('sectionIntro')
  featureIntro.innerHTML = '<strong>不只是换肤</strong><span>参考成熟工作台的模块划分，保留真正有用的五项能力。</span>'
  const featureList = document.createElement('div')
  featureList.className = cls('featureList')
  for (const feature of FEATURES) {
    const item = document.createElement('article')
    item.className = cls('featureItem')
    const copy = document.createElement('div')
    const title = document.createElement('strong')
    title.textContent = feature.name
    const description = document.createElement('span')
    description.textContent = feature.description
    copy.append(title, description)
    const badge = document.createElement('span')
    badge.className = cls('featureBadge')
    badge.textContent = '已启用'
    item.append(copy, badge)
    featureList.append(item)
  }
  featuresPanel.append(featureIntro, featureList)
  studioPanel.append(studioHeader, tabList, panelContainer)
  studioBackdrop.append(studioPanel)

  const favicon = document.createElement('link')
  favicon.rel = 'icon'

  const closeMenu = (): void => {
    menu.hidden = true
    selector.setAttribute('aria-expanded', 'false')
  }

  const selectStudioTab = (id: string): void => {
    activeStudioTab = tabPanels.has(id) ? id : 'themes'
    for (const [tabId, button] of tabButtons) {
      const selected = tabId === activeStudioTab
      button.setAttribute('aria-selected', String(selected))
      const panel = tabPanels.get(tabId)
      if (panel !== undefined) panel.hidden = !selected
    }
  }

  const setPauseReason = (reason: string, paused: boolean): void => {
    if (paused) pauseReasons.add(reason)
    else pauseReasons.delete(reason)
    companionScheduler.setPaused(pauseReasons.size > 0)
    if (pauseReasons.size === 0) applyPreviewState()
  }

  const closeStudio = (): void => {
    studioBackdrop.hidden = true
    studioButton.setAttribute('aria-expanded', 'false')
    setPauseReason('studio', false)
  }

  const openStudio = (tab = activeStudioTab): void => {
    selectStudioTab(tab)
    studioBackdrop.hidden = false
    studioButton.setAttribute('aria-expanded', 'true')
    setPauseReason('studio', true)
    studioClose.focus()
  }

  const findHostSettingsDialog = (): HTMLElement | undefined => Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'),
  ).find(dialog => dialog.querySelector('nav') !== null)

  const syncHostSettingsIntegration = (): void => {
    const settingsDialog = findHostSettingsDialog()
    if (settingsDialog === undefined) {
      body.removeAttribute('data-catnap-settings-open')
      setPauseReason('settings', false)
      return
    }

    body.setAttribute('data-catnap-settings-open', '')
    setPauseReason('settings', true)
    if (settingsThemeBlock.isConnected) return
    const cubeRow = Array.from(settingsDialog.querySelectorAll<HTMLElement>('div')).find((candidate) => {
      const directButtons = candidate.querySelectorAll(':scope > button[aria-pressed]')
      return directButtons.length >= 3
    })
    cubeRow?.parentElement?.append(settingsThemeBlock)
  }

  const syncComposerOverlayState = (): void => {
    const composerOpen = isComposerOverlayOpen()
    if (composerOpen) body.setAttribute('data-catnap-composer-overlay-open', '')
    else body.removeAttribute('data-catnap-composer-overlay-open')
    setPauseReason('composer-overlay', composerOpen)
    const externalOverlayOpen = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"], [role="menu"], [role="listbox"]'))
      .some(element => !studioBackdrop.contains(element) && !element.hidden && element.getAttribute('aria-hidden') !== 'true')
    setPauseReason('external-overlay', externalOverlayOpen)
  }

  const scheduleComposerOverlaySync = (): void => {
    if (composerOverlayTimer !== undefined) window.clearTimeout(composerOverlayTimer)
    composerOverlayTimer = window.setTimeout(() => {
      composerOverlayTimer = undefined
      syncComposerOverlayState()
    }, 0)
  }

  const flashPetBubble = (message: string): void => {
    petBubble.textContent = message
    petBubble.dataset.visible = 'true'
    if (petBubbleTimer !== undefined) window.clearTimeout(petBubbleTimer)
    petBubbleTimer = window.setTimeout(() => {
      petBubbleTimer = undefined
      delete petBubble.dataset.visible
    }, 2600)
  }

  const positionPet = (): void => {
    if (companionState.x === undefined || companionState.y === undefined) {
      petButton.style.removeProperty('left')
      petButton.style.removeProperty('top')
      petButton.style.removeProperty('right')
      petButton.style.removeProperty('bottom')
      return
    }
    const rect = petButton.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 104
    const height = rect.height > 0 ? rect.height : 128
    companionState.x = clamp(companionState.x, 8, Math.max(8, window.innerWidth - width - 8))
    companionState.y = clamp(companionState.y, 42, Math.max(42, window.innerHeight - height - 28))
    petButton.style.left = `${Math.round(companionState.x)}px`
    petButton.style.top = `${Math.round(companionState.y)}px`
    petButton.style.right = 'auto'
    petButton.style.bottom = 'auto'
  }

  const renderCompanion = (): void => {
    const definition = THEMES[activeTheme]
    const state = companionMachine.state
    companionName.textContent = companionState.name
    companionMood.textContent = stateLabel(state)
    companionMeta.textContent = companionState.autonomousActivity ? '会在工作间隙安静伸展和玩耍' : '自主活动已关闭'
    visibilityAction.textContent = companionState.hidden ? '召回猫咪' : '隐藏猫咪'
    renameInput.value = companionState.name
    soundToggle.checked = companionState.soundEnabled
    volumeInput.value = String(Math.round(companionState.volume * 100))
    volumeInput.disabled = !companionState.soundEnabled
    autonomousToggle.checked = companionState.autonomousActivity
    petButton.hidden = companionState.hidden
    petButton.dataset.companionState = state
    petImage.src = assetForState(definition.workCompanion, state)
    companionPortrait.src = assetForState(definition.workCompanion, state)
    studioButtonImage.src = definition.workCompanion.bed
    studioHeaderArt.src = definition.workCompanion.bed
    positionPet()
  }
  const unsubscribeCompanionState = companionMachine.subscribe(() => renderCompanion())
  const onReducedMotionChange = (event: MediaQueryListEvent): void => {
    companionScheduler.setReducedMotion(event.matches)
    renderCompanion()
  }
  reducedMotionQuery?.addEventListener?.('change', onReducedMotionChange)

  const reposition = (): void => {
    positionDecor(activeTheme, mascot, companion)
    positionPet()
  }
  const scheduleReposition = (): void => {
    if (typeof window.requestAnimationFrame !== 'function') {
      reposition()
      return
    }
    if (repositionFrame !== undefined && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(repositionFrame)
    }
    repositionFrame = window.requestAnimationFrame(() => {
      repositionFrame = undefined
      reposition()
    })
  }

  const activateTheme = (theme: ThemeId, persist: boolean): void => {
    activeTheme = theme
    const definition = THEMES[theme]
    activeSkinTitle = displayTitle(definition)
    body.dataset.catnapTheme = theme
    body.style.setProperty('--catnap-texture', `url("${definition.texture}")`)
    body.style.setProperty('--catnap-hero-art', `url("${definition.mascot}")`)
    titlebarIcon.src = theme === 'moonlit' ? definition.companion ?? definition.mascot : definition.mascot
    titlebarTitle.textContent = activeSkinTitle
    selector.textContent = definition.label
    mascot.src = definition.mascot
    if (definition.companion === undefined) companion.removeAttribute('src')
    else companion.src = definition.companion
    favicon.href = titlebarIcon.src
    document.title = activeSkinTitle
    definition.status.forEach((label, index) => {
      const cell = statusCells[index]
      if (cell !== undefined) cell.textContent = label
    })
    for (const [id, option] of options) option.setAttribute('aria-checked', String(id === theme))
    for (const [id, card] of themeCards) {
      const active = id === theme
      card.setAttribute('aria-pressed', String(active))
      const state = card.querySelector(`.${cls('themeCardState')}`)
      if (state !== null) state.textContent = active ? '正在使用' : '试穿'
    }
    for (const [id, card] of settingsThemeCards) {
      const active = id === theme
      card.setAttribute('aria-pressed', String(active))
      const state = card.querySelector(`.${cls('settingsThemeState')}`)
      if (state !== null) state.textContent = active ? '正在使用' : '使用'
    }
    renderCompanion()
    if (persist) storeTheme(theme)
    closeMenu()
    scheduleReposition()
  }

  selector.addEventListener('click', () => {
    menu.hidden = !menu.hidden
    selector.setAttribute('aria-expanded', String(!menu.hidden))
    if (!menu.hidden) options.get(activeTheme)?.focus()
  })
  for (const [id, option] of options) option.addEventListener('click', () => activateTheme(id, true))
  for (const [id, card] of themeCards) optionListener(card, () => activateTheme(id, true))
  for (const [id, card] of settingsThemeCards) optionListener(card, () => activateTheme(id, true))
  for (const [id, button] of tabButtons) optionListener(button, () => selectStudioTab(id))

  function optionListener(element: HTMLElement, listener: () => void): void {
    element.addEventListener('click', listener)
  }

  studioButton.addEventListener('click', () => openStudio('companion'))
  settingsStudioButton.addEventListener('click', () => {
    const settingsDialog = findHostSettingsDialog()
    const closeButton = settingsDialog === undefined
      ? undefined
      : Array.from(settingsDialog.querySelectorAll<HTMLButtonElement>('button')).find((button) => {
          const label = button.textContent?.trim()
          return label === '关闭' || label === 'Close'
        })
    closeButton?.click()
    window.setTimeout(() => openStudio('companion'), 0)
  })
  studioClose.addEventListener('click', closeStudio)
  studioBackdrop.addEventListener('click', (event) => {
    if (event.target === studioBackdrop) closeStudio()
  })
  const performPet = (): void => {
    if (!companionScheduler.pet()) return
    companionAudio.playPurr()
    flashPetBubble('呼噜……')
  }
  petButton.addEventListener('click', (event) => {
    if (event.detail === 0) performPet()
  })
  petAction.addEventListener('click', performPet)
  visibilityAction.addEventListener('click', () => {
    companionState.hidden = !companionState.hidden
    storeCompanionPreferences(companionState, window.localStorage)
    renderCompanion()
  })
  renameAction.addEventListener('click', () => {
    const nextName = renameInput.value.trim().slice(0, 18)
    if (nextName === '') return
    companionState.name = nextName
    storeCompanionPreferences(companionState, window.localStorage)
    renderCompanion()
  })
  soundToggle.addEventListener('change', () => {
    companionState.soundEnabled = soundToggle.checked
    companionAudio.configure(companionState.soundEnabled, companionState.volume)
    storeCompanionPreferences(companionState, window.localStorage)
    renderCompanion()
  })
  volumeInput.addEventListener('input', () => {
    companionState.volume = clamp(Number(volumeInput.value) / 100, 0, 1)
    companionAudio.configure(companionState.soundEnabled, companionState.volume)
    storeCompanionPreferences(companionState, window.localStorage)
  })
  autonomousToggle.addEventListener('change', () => {
    companionState.autonomousActivity = autonomousToggle.checked
    companionScheduler.setAutonomousActivity(companionState.autonomousActivity)
    storeCompanionPreferences(companionState, window.localStorage)
    renderCompanion()
  })
  const onPetPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return
    const rect = petButton.getBoundingClientRect()
    petDragOrigin = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: rect.left,
      top: rect.top,
    }
    draggingPet = false
    petButton.setPointerCapture?.(event.pointerId)
  }
  const onPetPointerMove = (event: PointerEvent): void => {
    if (petDragOrigin === undefined) return
    const dx = event.clientX - petDragOrigin.pointerX
    const dy = event.clientY - petDragOrigin.pointerY
    if (!draggingPet && Math.hypot(dx, dy) < 5) return
    draggingPet = true
    companionState.x = petDragOrigin.left + dx
    companionState.y = petDragOrigin.top + dy
    positionPet()
  }
  const onPetPointerUp = (event: PointerEvent): void => {
    if (petDragOrigin === undefined) return
    petButton.releasePointerCapture?.(event.pointerId)
    petDragOrigin = undefined
    if (!draggingPet) {
      performPet()
      return
    }
    draggingPet = false
    storeCompanionPreferences(companionState, window.localStorage)
  }
  const onPetPointerCancel = (event: PointerEvent): void => {
    if (petDragOrigin === undefined) return
    petButton.releasePointerCapture?.(event.pointerId)
    petDragOrigin = undefined
    draggingPet = false
  }
  petButton.addEventListener('pointerdown', onPetPointerDown)
  petButton.addEventListener('pointermove', onPetPointerMove)
  petButton.addEventListener('pointerup', onPetPointerUp)
  petButton.addEventListener('pointercancel', onPetPointerCancel)

  const onPointerDown = (event: PointerEvent): void => {
    if (!menu.hidden && event.target instanceof Node && !statusbar.contains(event.target)) closeMenu()
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu()
      selector.focus()
      return
    }
    if (event.key === 'Escape' && !studioBackdrop.hidden) {
      closeStudio()
      studioButton.focus()
    }
  }
  const onTyping = (event: Event): void => {
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable)) {
      companionScheduler.noteTyping()
    }
  }
  const onVisibilityChange = (): void => setPauseReason('visibility', document.visibilityState !== 'visible')
  const onWindowBlur = (): void => setPauseReason('window-blur', true)
  const onWindowFocus = (): void => setPauseReason('window-blur', false)

  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('input', onTyping)
  document.addEventListener('visibilitychange', onVisibilityChange)
  document.addEventListener('click', scheduleComposerOverlaySync)
  document.addEventListener('keyup', scheduleComposerOverlaySync)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('focus', onWindowFocus)
  window.addEventListener('resize', reposition)
  window.addEventListener('scroll', reposition, true)

  document.head.append(favicon)
  selectStudioTab('themes')
  body.append(titlebar, statusbar, mascot, companion, petButton, studioBackdrop)
  activateTheme(activeTheme, false)
  syncHostSettingsIntegration()
  syncComposerOverlayState()
  onVisibilityChange()

  const mutationObserver = typeof MutationObserver === 'undefined'
    ? undefined
    : new MutationObserver(() => {
        ensureHostPaneMarkers()
        syncHostSettingsIntegration()
        reposition()
        syncComposerOverlayState()
      })
  mutationObserver?.observe(body, {
    childList: true,
    subtree: true,
  })
  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? undefined
    : new ResizeObserver(reposition)
  resizeObserver?.observe(body)

  ctx.effect(() => () => {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('input', onTyping)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.removeEventListener('click', scheduleComposerOverlaySync)
    document.removeEventListener('keyup', scheduleComposerOverlaySync)
    window.removeEventListener('blur', onWindowBlur)
    window.removeEventListener('focus', onWindowFocus)
    window.removeEventListener('resize', reposition)
    window.removeEventListener('scroll', reposition, true)
    reducedMotionQuery?.removeEventListener?.('change', onReducedMotionChange)
    unsubscribeCompanionState()
    companionScheduler.destroy()
    companionAudio.dispose()
    mutationObserver?.disconnect()
    resizeObserver?.disconnect()
    if (repositionFrame !== undefined && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(repositionFrame)
    }
    if (petBubbleTimer !== undefined) window.clearTimeout(petBubbleTimer)
    if (composerOverlayTimer !== undefined) window.clearTimeout(composerOverlayTimer)
    titlebar.remove()
    statusbar.remove()
    mascot.remove()
    companion.remove()
    petButton.remove()
    studioBackdrop.remove()
    settingsThemeBlock.remove()
    favicon.remove()

    if (originalBodyMarker === null) body.removeAttribute('data-dsh-catnap')
    else body.setAttribute('data-dsh-catnap', originalBodyMarker)
    if (originalTheme === null) body.removeAttribute('data-catnap-theme')
    else body.setAttribute('data-catnap-theme', originalTheme)
    if (originalSettingsOpen === null) body.removeAttribute('data-catnap-settings-open')
    else body.setAttribute('data-catnap-settings-open', originalSettingsOpen)
    if (originalComposerOverlayOpen === null) body.removeAttribute('data-catnap-composer-overlay-open')
    else body.setAttribute('data-catnap-composer-overlay-open', originalComposerOverlayOpen)
    if (originalTexture === '') body.style.removeProperty('--catnap-texture')
    else body.style.setProperty('--catnap-texture', originalTexture, originalTexturePriority)
    if (originalHero === '') body.style.removeProperty('--catnap-hero-art')
    else body.style.setProperty('--catnap-hero-art', originalHero, originalHeroPriority)
    for (const [pane, originalPane] of ownedPaneMarkers) {
      if (originalPane === null) pane.removeAttribute('data-pane')
      else pane.setAttribute('data-pane', originalPane)
    }
    if (document.title === activeSkinTitle) document.title = originalTitle
  }, 'ui-skin-catnap: cat workbench themes, center, and companion')
}
