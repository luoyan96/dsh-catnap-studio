// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const testWindow = window as unknown as Window & {
  __ModuleLoader__: { load: (handoff: unknown) => void }
}
testWindow.__ModuleLoader__ = { load: () => {} }

const { apply } = await import('../src/client/index.ts')

type Disposer = () => void

const flushAsyncWork = (): Promise<void> => new Promise(resolve => window.setTimeout(resolve, 0))

function applySkin(): Disposer {
  let disposer: Disposer | undefined
  const ctx = {
    effect(factory: () => Disposer): void {
      disposer = factory()
    },
  }
  apply(ctx as never)
  if (disposer === undefined) throw new Error('skin did not register a disposer')
  return disposer
}

describe('Catnap Studio skin', () => {
  beforeEach(() => {
    vi.stubGlobal('Audio', class {
      currentTime = 0
      volume = 1
      preload = ''
      play(): Promise<void> { return Promise.resolve() }
      pause(): void {}
    })
    window.history.replaceState({}, '', '/')
    window.localStorage.clear()
    document.head.innerHTML = ''
    document.body.removeAttribute('data-dsh-catnap')
    document.body.removeAttribute('data-catnap-theme')
    document.body.removeAttribute('data-catnap-better-sidebar')
    document.body.style.removeProperty('--catnap-texture')
    document.body.style.removeProperty('--catnap-hero-art')
    document.body.innerHTML = [
      '<div id="sidebar-column"><aside data-slot="sidebar"></aside></div>',
      '<main id="conversation-column"><section data-slot="conversation"></section><textarea style="width: 640px; height: 120px"></textarea></main>',
      '<div id="details-column" data-pane="host-details"><aside data-slot="details"></aside></div>',
    ].join('')
    document.title = 'DeepSeek Harness'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    window.history.replaceState({}, '', '/')
    window.localStorage.clear()
    document.body.removeAttribute('data-dsh-catnap')
    document.body.removeAttribute('data-catnap-theme')
    document.body.removeAttribute('data-catnap-better-sidebar')
    document.body.style.removeProperty('--catnap-texture')
    document.body.style.removeProperty('--catnap-hero-art')
  })

  it('applies the warm theme by default and fully retracts its owned UI', () => {
    const dispose = applySkin()

    expect(document.body.hasAttribute('data-dsh-catnap')).toBe(true)
    expect(document.body.dataset.catnapTheme).toBe('warm')
    expect(document.querySelector('[data-skin-chrome="titlebar"]')?.textContent).toContain('暖纸猫窝')
    expect(document.querySelector('[data-skin-chrome="statusbar"]')?.textContent).toContain('猫咪在线')
    expect(document.querySelector('[data-skin-chrome="theme-selector"]')?.textContent).toBe('暖纸猫窝')
    expect(document.querySelector<HTMLImageElement>('[data-skin-chrome="mascot"]')?.src).toMatch(/^data:image\/png;base64,/)
    expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toMatch(/^data:image\/png;base64,/)
    expect(document.body.style.getPropertyValue('--catnap-texture')).toMatch(/^url\("data:image\/webp;base64,/)
    expect(document.body.style.getPropertyValue('--catnap-hero-art')).toMatch(/^url\("data:image\/png;base64,/)
    expect(document.title).toBe('暖纸猫窝 · DeepSeek Harness')

    dispose()

    expect(document.body.hasAttribute('data-dsh-catnap')).toBe(false)
    expect(document.body.hasAttribute('data-catnap-theme')).toBe(false)
    expect(document.body.style.getPropertyValue('--catnap-texture')).toBe('')
    expect(document.body.style.getPropertyValue('--catnap-hero-art')).toBe('')
    expect(document.querySelector('[data-skin-chrome]')).toBeNull()
    expect(document.querySelector('link[rel="icon"]')).toBeNull()
    expect(document.title).toBe('DeepSeek Harness')
  })

  it('switches themes from the status-bar menu and persists the choice', () => {
    const dispose = applySkin()
    const selector = document.querySelector<HTMLButtonElement>('[data-skin-chrome="theme-selector"]')
    const moonlit = document.querySelector<HTMLButtonElement>('[data-theme-option="moonlit"]')

    selector?.click()
    expect(selector?.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector<HTMLElement>('[data-skin-chrome="theme-menu"]')?.hidden).toBe(false)
    moonlit?.click()

    expect(document.body.dataset.catnapTheme).toBe('moonlit')
    expect(selector?.textContent).toBe('月夜守护')
    expect(moonlit?.getAttribute('aria-checked')).toBe('true')
    expect(document.querySelector<HTMLImageElement>('[data-skin-chrome="companion"]')?.src).toMatch(/^data:image\/png;base64,/)
    expect(window.localStorage.getItem('dsh-catnap-theme')).toBe('moonlit')
    expect(document.title).toBe('月夜守护 · DeepSeek Harness')

    dispose()
    expect(window.localStorage.getItem('dsh-catnap-theme')).toBe('moonlit')
  })

  it('uses Catnap Desktop branding when embedded by the desktop shell', () => {
    window.history.replaceState({}, '', '/?catnap-desktop=1')
    const dispose = applySkin()

    expect(document.title).toBe('Catnap Desktop · 暖纸猫窝')
    expect(document.querySelector('[data-skin-chrome="titlebar"]')?.textContent).toContain('Catnap Desktop · 暖纸猫窝')

    dispose()
  })

  it('restores the last selected theme when the skin is applied again', () => {
    window.localStorage.setItem('dsh-catnap-theme', 'atelier')
    const dispose = applySkin()

    expect(document.body.dataset.catnapTheme).toBe('atelier')
    expect(document.querySelector('[data-skin-chrome="theme-selector"]')?.textContent).toBe('猫咪工坊')
    expect(document.title).toBe('猫咪工坊 · DeepSeek Harness')

    dispose()
  })

  it('does not overwrite a session-projected title during teardown', () => {
    const dispose = applySkin()
    document.title = 'Refactor the skin layer'

    dispose()

    expect(document.title).toBe('Refactor the skin layer')
  })

  it('opens the studio, switches tabs, and selects a theme from the wardrobe', () => {
    const dispose = applySkin()
    const studioButton = document.querySelector<HTMLButtonElement>('[data-skin-chrome="studio-button"]')
    const backdrop = document.querySelector<HTMLElement>('[data-skin-chrome="studio-backdrop"]')

    expect(backdrop?.hidden).toBe(true)
    studioButton?.click()
    expect(backdrop?.hidden).toBe(false)
    expect(studioButton?.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('[data-studio-panel="companion"]')?.hasAttribute('hidden')).toBe(false)

    document.querySelector<HTMLButtonElement>('[data-studio-tab="features"]')?.click()
    expect(document.querySelector('[data-studio-panel="features"]')?.hasAttribute('hidden')).toBe(false)

    document.querySelector<HTMLButtonElement>('[data-studio-theme="moonlit"]')?.click()
    expect(document.body.dataset.catnapTheme).toBe('moonlit')
    expect(window.localStorage.getItem('dsh-catnap-theme')).toBe('moonlit')

    document.querySelector<HTMLButtonElement>('[data-studio-action="close"]')?.click()
    expect(backdrop?.hidden).toBe(true)
    dispose()
  })

  it('pets without opening Studio, while the separate bed opens companion settings', () => {
    const dispose = applySkin()
    const pet = document.querySelector<HTMLButtonElement>('[data-skin-chrome="cat-companion"]')
    const backdrop = document.querySelector<HTMLElement>('[data-skin-chrome="studio-backdrop"]')
    pet?.click()
    expect(pet?.dataset.companionState).toBe('petted')
    expect(backdrop?.hidden).toBe(true)

    document.querySelector<HTMLButtonElement>('[data-skin-chrome="studio-button"]')?.click()
    expect(backdrop?.hidden).toBe(false)
    expect(document.querySelector('[data-studio-panel="companion"]')?.hasAttribute('hidden')).toBe(false)

    const rename = document.querySelector<HTMLInputElement>('[data-companion-field="name"]')
    if (rename !== null) rename.value = 'Mochi'
    document.querySelector<HTMLButtonElement>('[data-companion-action="rename"]')?.click()

    const sound = document.querySelector<HTMLInputElement>('[data-companion-field="sound"]')
    if (sound !== null) {
      sound.checked = false
      sound.dispatchEvent(new Event('change'))
    }

    const state = JSON.parse(window.localStorage.getItem('dsh-catnap-companion') ?? '{}') as {
      name?: string
      hidden?: boolean
      soundEnabled?: boolean
    }
    expect(state).toMatchObject({ name: 'Mochi', hidden: false, soundEnabled: false })

    document.querySelector<HTMLButtonElement>('[data-companion-action="visibility"]')?.click()
    expect(document.querySelector<HTMLButtonElement>('[data-skin-chrome="cat-companion"]')?.hidden).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('dsh-catnap-companion') ?? '{}')).toMatchObject({ hidden: true })
    dispose()
  })

  it('uses the five-pixel drag threshold and persists the moved position', () => {
    const dispose = applySkin()
    const pet = document.querySelector<HTMLButtonElement>('[data-skin-chrome="cat-companion"]')
    pet?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }))
    pet?.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, button: 0, clientX: 22, clientY: 18 }))
    pet?.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0, clientX: 22, clientY: 18 }))

    expect(pet?.dataset.companionState).toBe('resting')
    expect(JSON.parse(window.localStorage.getItem('dsh-catnap-companion') ?? '{}')).toMatchObject({ x: 12, y: 42 })
    dispose()
  })

  it('places the default companion below the composer instead of over the Files panel', () => {
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea')
    if (textarea !== null) {
      textarea.getBoundingClientRect = () => ({
        x: 220,
        y: 320,
        top: 320,
        right: 860,
        bottom: 440,
        left: 220,
        width: 640,
        height: 120,
        toJSON: () => ({}),
      })
    }

    const dispose = applySkin()
    const pet = document.querySelector<HTMLButtonElement>('[data-skin-chrome="cat-companion"]')

    expect(pet?.style.left).toBe('236px')
    expect(pet?.style.top).toBe('512px')
    expect(pet?.style.right).toBe('auto')

    dispose()
  })

  it('moves theme selection into Settings appearance and suppresses decorative cats', async () => {
    const settingsDialog = document.createElement('div')
    settingsDialog.setAttribute('role', 'dialog')
    settingsDialog.setAttribute('aria-modal', 'true')
    settingsDialog.innerHTML = [
      '<nav></nav>',
      '<div id="appearance-group">',
      '<div>外观</div>',
      '<div id="appearance-cubes">',
      '<button aria-pressed="true">浅色</button>',
      '<button aria-pressed="false">深色</button>',
      '<button aria-pressed="false">跟随系统</button>',
      '</div>',
      '</div>',
      '<button>关闭</button>',
    ].join('')
    document.body.append(settingsDialog)

    const dispose = applySkin()
    const settingsAppearance = document.querySelector<HTMLElement>('[data-skin-chrome="settings-appearance"]')

    expect(document.body.hasAttribute('data-catnap-settings-open')).toBe(true)
    expect(settingsAppearance?.parentElement?.id).toBe('appearance-group')
    expect(settingsAppearance?.querySelectorAll('[data-settings-theme]')).toHaveLength(3)

    settingsAppearance?.querySelector<HTMLButtonElement>('[data-settings-theme="atelier"]')?.click()
    expect(document.body.dataset.catnapTheme).toBe('atelier')
    expect(window.localStorage.getItem('dsh-catnap-theme')).toBe('atelier')
    expect(settingsAppearance?.querySelector('[data-settings-theme="atelier"]')?.getAttribute('aria-pressed')).toBe('true')

    settingsDialog.remove()
    await Promise.resolve()
    expect(document.body.hasAttribute('data-catnap-settings-open')).toBe(false)
    dispose()
  })

  it('suppresses cats while a composer popover is expanded and restores them when it closes', async () => {
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea')
    const trigger = document.createElement('button')
    trigger.setAttribute('aria-haspopup', 'menu')
    trigger.setAttribute('aria-expanded', 'true')
    document.body.append(trigger)

    if (textarea !== null) {
      textarea.getBoundingClientRect = () => ({
        x: 200,
        y: 300,
        top: 300,
        right: 840,
        bottom: 420,
        left: 200,
        width: 640,
        height: 120,
        toJSON: () => ({}),
      })
    }
    trigger.getBoundingClientRect = () => ({
      x: 650,
      y: 430,
      top: 430,
      right: 820,
      bottom: 466,
      left: 650,
      width: 170,
      height: 36,
      toJSON: () => ({}),
    })

    const dispose = applySkin()
    expect(document.body.hasAttribute('data-catnap-composer-overlay-open')).toBe(true)

    trigger.setAttribute('aria-expanded', 'false')
    trigger.click()
    await new Promise(resolve => window.setTimeout(resolve, 0))
    expect(document.body.hasAttribute('data-catnap-composer-overlay-open')).toBe(false)

    dispose()
  })

  it('suppresses cats for a host model menu outside the composer and restores them on close', async () => {
    const modelMenu = document.createElement('div')
    modelMenu.setAttribute('role', 'listbox')
    modelMenu.textContent = '选择模型'
    document.body.append(modelMenu)

    const dispose = applySkin()
    expect(document.body.hasAttribute('data-catnap-external-overlay-open')).toBe(true)

    modelMenu.hidden = true
    document.body.dispatchEvent(new Event('click', { bubbles: true }))
    await new Promise(resolve => window.setTimeout(resolve, 0))
    expect(document.body.hasAttribute('data-catnap-external-overlay-open')).toBe(false)

    dispose()
  })

  it('projects host pane markers for bundled workbench modules and restores them', () => {
    const sidebar = document.querySelector<HTMLElement>('#sidebar-column')
    const conversation = document.querySelector<HTMLElement>('#conversation-column')
    const details = document.querySelector<HTMLElement>('#details-column')
    const dispose = applySkin()

    expect(sidebar?.dataset.pane).toBe('sidebar')
    expect(conversation?.dataset.pane).toBe('conversation')
    expect(details?.dataset.pane).toBe('details')

    dispose()

    expect(sidebar?.hasAttribute('data-pane')).toBe(false)
    expect(conversation?.hasAttribute('data-pane')).toBe(false)
    expect(details?.dataset.pane).toBe('host-details')
  })

  it('uses Better Sidebar when available instead of activating legacy Aion and Git clients', async () => {
    const applied: string[] = []
    const modules = {
      import: vi.fn(async (id: string) => ({ apply: () => applied.push(id) })),
    }
    vi.stubGlobal('__DSH_MODULES__', modules)

    const dispose = applySkin()
    await flushAsyncWork()

    expect(document.body.hasAttribute('data-catnap-better-sidebar')).toBe(true)
    expect(applied).toContain('@linxin666/dsh-client-ui-task-board')
    expect(applied).not.toContain('@linxin666/dsh-client-ui-aionui-panel')
    expect(applied).not.toContain('@linxin666/dsh-client-ui-git-graph')

    dispose()
    expect(document.body.hasAttribute('data-catnap-better-sidebar')).toBe(false)
  })

  it('falls back to the legacy workbench clients when Better Sidebar is absent', async () => {
    const applied: string[] = []
    const modules = {
      import: vi.fn(async (id: string) => {
        if (id === 'dsh-better-sidebar') throw new Error('not installed')
        return { apply: () => applied.push(id) }
      }),
    }
    vi.stubGlobal('__DSH_MODULES__', modules)

    const dispose = applySkin()
    await flushAsyncWork()

    expect(document.body.hasAttribute('data-catnap-better-sidebar')).toBe(false)
    expect(applied).toContain('@linxin666/dsh-client-ui-aionui-panel')
    expect(applied).toContain('@linxin666/dsh-client-ui-git-graph')

    dispose()
  })

  it('restores the Better Sidebar body marker during disposal', async () => {
    const modules = { import: vi.fn(async () => ({ apply: () => {} })) }
    vi.stubGlobal('__DSH_MODULES__', modules)
    document.body.setAttribute('data-catnap-better-sidebar', 'previous')

    const dispose = applySkin()
    await flushAsyncWork()
    expect(document.body.getAttribute('data-catnap-better-sidebar')).toBe('previous')

    dispose()
    expect(document.body.getAttribute('data-catnap-better-sidebar')).toBe('previous')
  })

  it('does not activate modules or write the Better Sidebar marker after disposal wins the async probe', async () => {
    let resolveProbe: ((value: unknown) => void) | undefined
    const applied = vi.fn()
    const modules = {
      import: vi.fn((id: string) => id === 'dsh-better-sidebar'
        ? new Promise(resolve => { resolveProbe = resolve })
        : Promise.resolve({ apply: applied })),
    }
    vi.stubGlobal('__DSH_MODULES__', modules)

    const dispose = applySkin()
    await flushAsyncWork()
    dispose()
    resolveProbe?.({})
    await flushAsyncWork()

    expect(document.body.hasAttribute('data-catnap-better-sidebar')).toBe(false)
    expect(applied).not.toHaveBeenCalled()
  })
})
