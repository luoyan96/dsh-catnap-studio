/**
 * Catnap Studio is a presentation-only DSH Web skin. The client entry owns
 * every DOM write it performs and retracts the body attributes, decorative
 * chrome, mascot, favicon, observers, listeners, and its document title.
 */
import type { Context } from '@deepseek-ai/cordis'
import css from './catnap.module.css'
import { THEME_ASSETS } from './generated/theme-assets.ts'

type ThemeId = 'warm' | 'moonlit' | 'atelier'

interface ThemeDefinition {
  label: string
  title: string
  status: readonly string[]
  mascot: string
  companion?: string
  texture: string
}

const STORAGE_KEY = 'dsh-catnap-theme'
const THEME_IDS: readonly ThemeId[] = ['warm', 'moonlit', 'atelier']
const THEMES: Record<ThemeId, ThemeDefinition> = {
  warm: {
    label: '暖纸猫窝',
    title: '暖纸猫窝 · DeepSeek Harness',
    status: ['CATNAP', '就绪', '猫咪在线', '暖灯已开'],
    mascot: THEME_ASSETS.warmCat,
    texture: THEME_ASSETS.warmTexture,
  },
  moonlit: {
    label: '月夜守护',
    title: '月夜守护 · DeepSeek Harness',
    status: ['MOONLIT', '夜间专注', '猫咪守夜', '暖灯已开'],
    mascot: THEME_ASSETS.moonlitSleeper,
    companion: THEME_ASSETS.moonlitGuardian,
    texture: THEME_ASSETS.moonlitTexture,
  },
  atelier: {
    label: '猫咪工坊',
    title: '猫咪工坊 · DeepSeek Harness',
    status: ['ATELIER', '就绪', '猫咪协作中', '灵感在线'],
    mascot: THEME_ASSETS.atelierTuxedo,
    texture: THEME_ASSETS.atelierTexture,
  },
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

function findComposer(): DOMRect | undefined {
  return Array.from(document.querySelectorAll('textarea'))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width >= 320 && rect.height >= 48)
    .sort((left, right) => right.width - left.width)[0]
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
    const width = Math.min(420, Math.max(320, composer.width * 0.48))
    const height = width * 0.485
    const top = window.innerHeight - height - 38
    if (top < composer.bottom + 28 || window.innerWidth < 1080) {
      mascot.hidden = true
    } else {
      mascot.style.width = `${Math.round(width)}px`
      mascot.style.left = `${Math.round(window.innerWidth - width - 38)}px`
      mascot.style.top = `${Math.round(top)}px`
    }

    const sidebar = document.querySelector('[data-pane="sidebar"]')?.getBoundingClientRect()
    if (sidebar !== undefined && sidebar.width >= 240) {
      companion.hidden = false
      companion.style.width = '112px'
      companion.style.left = `${Math.round(sidebar.right + 22)}px`
      companion.style.top = '54px'
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
  const originalTitle = document.title
  const originalBodyMarker = body.getAttribute('data-dsh-catnap')
  const originalTheme = body.getAttribute('data-catnap-theme')
  const originalTexture = body.style.getPropertyValue('--catnap-texture')
  const originalTexturePriority = body.style.getPropertyPriority('--catnap-texture')
  let activeTheme = readStoredTheme()
  let activeSkinTitle = THEMES[activeTheme].title
  let repositionFrame: number | undefined

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
  statusbar.prepend(statusLabel, spacer, selector, menu)

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

  const favicon = document.createElement('link')
  favicon.rel = 'icon'

  const closeMenu = (): void => {
    menu.hidden = true
    selector.setAttribute('aria-expanded', 'false')
  }

  const reposition = (): void => positionDecor(activeTheme, mascot, companion)
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
    activeSkinTitle = definition.title
    body.dataset.catnapTheme = theme
    body.style.setProperty('--catnap-texture', `url("${definition.texture}")`)
    titlebarIcon.src = theme === 'moonlit' ? definition.companion ?? definition.mascot : definition.mascot
    titlebarTitle.textContent = definition.title
    selector.textContent = definition.label
    mascot.src = definition.mascot
    if (definition.companion === undefined) companion.removeAttribute('src')
    else companion.src = definition.companion
    favicon.href = titlebarIcon.src
    document.title = definition.title
    definition.status.forEach((label, index) => {
      const cell = statusCells[index]
      if (cell !== undefined) cell.textContent = label
    })
    for (const [id, option] of options) option.setAttribute('aria-checked', String(id === theme))
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

  const onPointerDown = (event: PointerEvent): void => {
    if (!menu.hidden && event.target instanceof Node && !statusbar.contains(event.target)) closeMenu()
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu()
      selector.focus()
    }
  }

  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', reposition)
  window.addEventListener('scroll', reposition, true)

  document.head.append(favicon)
  body.append(titlebar, statusbar, mascot, companion)
  activateTheme(activeTheme, false)

  const mutationObserver = typeof MutationObserver === 'undefined'
    ? undefined
    : new MutationObserver(reposition)
  mutationObserver?.observe(body, { childList: true, subtree: true })
  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? undefined
    : new ResizeObserver(reposition)
  resizeObserver?.observe(body)

  ctx.effect(() => () => {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', reposition)
    window.removeEventListener('scroll', reposition, true)
    mutationObserver?.disconnect()
    resizeObserver?.disconnect()
    if (repositionFrame !== undefined && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(repositionFrame)
    }
    titlebar.remove()
    statusbar.remove()
    mascot.remove()
    companion.remove()
    favicon.remove()

    if (originalBodyMarker === null) body.removeAttribute('data-dsh-catnap')
    else body.setAttribute('data-dsh-catnap', originalBodyMarker)
    if (originalTheme === null) body.removeAttribute('data-catnap-theme')
    else body.setAttribute('data-catnap-theme', originalTheme)
    if (originalTexture === '') body.style.removeProperty('--catnap-texture')
    else body.style.setProperty('--catnap-texture', originalTexture, originalTexturePriority)
    if (document.title === activeSkinTitle) document.title = originalTitle
  }, 'ui-skin-catnap: selectable three-theme cat studio chrome')
}
