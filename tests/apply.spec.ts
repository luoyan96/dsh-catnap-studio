// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { apply } from '../src/client/index.ts'

type Disposer = () => void

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
    window.localStorage.clear()
    document.head.innerHTML = ''
    document.body.removeAttribute('data-dsh-catnap')
    document.body.removeAttribute('data-catnap-theme')
    document.body.style.removeProperty('--catnap-texture')
    document.body.innerHTML = [
      '<aside data-pane="sidebar"></aside>',
      '<textarea style="width: 640px; height: 120px"></textarea>',
    ].join('')
    document.title = 'DeepSeek Harness'
  })

  afterEach(() => {
    window.localStorage.clear()
    document.body.removeAttribute('data-dsh-catnap')
    document.body.removeAttribute('data-catnap-theme')
    document.body.style.removeProperty('--catnap-texture')
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
    expect(document.title).toBe('暖纸猫窝 · DeepSeek Harness')

    dispose()

    expect(document.body.hasAttribute('data-dsh-catnap')).toBe(false)
    expect(document.body.hasAttribute('data-catnap-theme')).toBe(false)
    expect(document.body.style.getPropertyValue('--catnap-texture')).toBe('')
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
})
