import { CompanionStateMachine } from './state-machine.ts'

const SECOND = 1_000
const MINUTE = 60 * SECOND

export const COMPANION_TIMING = {
  initialMajorMin: 30 * SECOND,
  initialMajorMax: 60 * SECOND,
  stretchMin: 4 * MINUTE,
  stretchMax: 8 * MINUTE,
  yarnMin: 8 * MINUTE,
  yarnMax: 15 * MINUTE,
  majorGap: 3 * MINUTE,
  typingQuiet: 3 * SECOND,
  stretchDuration: 4 * SECOND,
  yarnDuration: 10 * SECOND,
  pettedDuration: 1_800,
  petCooldown: 2 * SECOND,
  sleepMin: 75 * SECOND,
  sleepMax: 150 * SECOND,
} as const

interface SchedulerClock {
  now: () => number
  setTimeout: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>
  clearTimeout: (timer: ReturnType<typeof setTimeout>) => void
  random: () => number
}

export interface CompanionSchedulerOptions {
  machine: CompanionStateMachine
  autonomousActivity: boolean
  reducedMotion: boolean
  clock?: Partial<SchedulerClock>
}

export function sampleDelay(min: number, max: number, random = Math.random): number {
  return Math.round(min + (max - min) * Math.min(1, Math.max(0, random())))
}

export class CompanionScheduler {
  #machine: CompanionStateMachine
  #clock: SchedulerClock
  #autonomousActivity: boolean
  #reducedMotion: boolean
  #paused = false
  #destroyed = false
  #lastTypingAt = Number.NEGATIVE_INFINITY
  #lastMajorAt = Number.NEGATIVE_INFINITY
  #lastPetAt = Number.NEGATIVE_INFINITY
  #timers = new Set<ReturnType<typeof setTimeout>>()

  constructor(options: CompanionSchedulerOptions) {
    this.#machine = options.machine
    this.#autonomousActivity = options.autonomousActivity
    this.#reducedMotion = options.reducedMotion
    this.#clock = {
      now: options.clock?.now ?? Date.now,
      setTimeout: options.clock?.setTimeout ?? ((callback, delay) => globalThis.setTimeout(callback, delay)),
      clearTimeout: options.clock?.clearTimeout ?? ((timer) => globalThis.clearTimeout(timer)),
      random: options.clock?.random ?? Math.random,
    }
    this.#scheduleInitial()
  }

  noteTyping(): void {
    this.#lastTypingAt = this.#clock.now()
  }

  pet(): boolean {
    const now = this.#clock.now()
    if (this.#paused || this.#destroyed || now - this.#lastPetAt < COMPANION_TIMING.petCooldown) return false
    this.#lastPetAt = now
    if (!this.#machine.pet()) return false
    this.#after(COMPANION_TIMING.pettedDuration, () => {
      this.#machine.settle()
    })
    return true
  }

  setAutonomousActivity(enabled: boolean): void {
    this.#autonomousActivity = enabled
    this.#restartAutonomous()
  }

  setReducedMotion(enabled: boolean): void {
    this.#reducedMotion = enabled
    this.#restartAutonomous()
  }

  setPaused(paused: boolean): void {
    if (paused === this.#paused || this.#destroyed) return
    this.#paused = paused
    this.#clearAll()
    if (paused) this.#machine.pause()
    else {
      this.#machine.resume()
      this.#scheduleInitial()
    }
  }

  destroy(): void {
    this.#destroyed = true
    this.#clearAll()
  }

  #restartAutonomous(): void {
    this.#clearAll()
    if (this.#machine.state !== 'petted' && this.#machine.state !== 'paused') this.#machine.settle()
    this.#scheduleInitial()
  }

  #scheduleInitial(): void {
    if (!this.#canAnimate()) return
    this.#after(sampleDelay(COMPANION_TIMING.initialMajorMin, COMPANION_TIMING.initialMajorMax, this.#clock.random), () => {
      this.#tryMajor('stretching')
    })
    this.#scheduleYarn()
    this.#scheduleSleep()
  }

  #scheduleStretch(): void {
    this.#after(sampleDelay(COMPANION_TIMING.stretchMin, COMPANION_TIMING.stretchMax, this.#clock.random), () => {
      this.#tryMajor('stretching')
    })
  }

  #scheduleYarn(): void {
    this.#after(sampleDelay(COMPANION_TIMING.yarnMin, COMPANION_TIMING.yarnMax, this.#clock.random), () => {
      if (this.#clock.random() < 0.45) this.#tryMajor('playing-yarn')
      else this.#scheduleYarn()
    })
  }

  #scheduleSleep(): void {
    this.#after(sampleDelay(COMPANION_TIMING.sleepMin, COMPANION_TIMING.sleepMax, this.#clock.random), () => {
      if (!this.#canAnimate()) return
      if (this.#machine.state !== 'resting') {
        this.#after(COMPANION_TIMING.typingQuiet, () => this.#scheduleSleep())
        return
      }
      this.#machine.setAutonomous('sleeping')
      this.#after(sampleDelay(30 * SECOND, 70 * SECOND, this.#clock.random), () => {
        if (this.#machine.state === 'sleeping') this.#machine.settle()
        this.#scheduleSleep()
      })
    })
  }

  #tryMajor(state: 'stretching' | 'playing-yarn'): void {
    if (!this.#canAnimate()) return
    const now = this.#clock.now()
    const quietRemaining = COMPANION_TIMING.typingQuiet - (now - this.#lastTypingAt)
    const gapRemaining = COMPANION_TIMING.majorGap - (now - this.#lastMajorAt)
    if (quietRemaining > 0 || gapRemaining > 0 || this.#machine.state !== 'resting') {
      this.#after(Math.max(SECOND, quietRemaining, gapRemaining), () => this.#tryMajor(state))
      return
    }
    this.#lastMajorAt = now
    this.#machine.setAutonomous(state)
    const duration = state === 'stretching' ? COMPANION_TIMING.stretchDuration : COMPANION_TIMING.yarnDuration
    this.#after(duration, () => {
      if (this.#machine.state === state) this.#machine.settle()
      if (state === 'stretching') this.#scheduleStretch()
      else this.#scheduleYarn()
    })
  }

  #canAnimate(): boolean {
    return !this.#destroyed && !this.#paused && this.#autonomousActivity && !this.#reducedMotion
  }

  #after(delay: number, callback: () => void): void {
    if (this.#destroyed) return
    const timer = this.#clock.setTimeout(() => {
      this.#timers.delete(timer)
      callback()
    }, Math.max(0, delay))
    this.#timers.add(timer)
  }

  #clearAll(): void {
    for (const timer of this.#timers) this.#clock.clearTimeout(timer)
    this.#timers.clear()
  }
}
