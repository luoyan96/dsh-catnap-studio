import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_TIMING, CompanionScheduler, sampleDelay } from '../src/client/companion/scheduler.ts'
import { CompanionStateMachine } from '../src/client/companion/state-machine.ts'

describe('CompanionScheduler', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('samples inclusive timing ranges', () => {
    expect(sampleDelay(30, 60, () => 0)).toBe(30)
    expect(sampleDelay(30, 60, () => 1)).toBe(60)
  })

  it('does not start a large action in the initial settle window', () => {
    const machine = new CompanionStateMachine()
    const scheduler = new CompanionScheduler({ machine, autonomousActivity: true, reducedMotion: false, clock: { random: () => 0 } })
    vi.advanceTimersByTime(COMPANION_TIMING.initialMajorMin - 1)
    expect(machine.state).toBe('resting')
    vi.advanceTimersByTime(1)
    expect(machine.state).toBe('stretching')
    scheduler.destroy()
  })

  it('gives direct petting priority with a two-second cooldown', () => {
    const machine = new CompanionStateMachine()
    const scheduler = new CompanionScheduler({ machine, autonomousActivity: false, reducedMotion: false })
    expect(scheduler.pet()).toBe(true)
    expect(machine.state).toBe('petted')
    vi.advanceTimersByTime(COMPANION_TIMING.pettedDuration)
    expect(machine.state).toBe('resting')
    expect(scheduler.pet()).toBe(false)
    vi.advanceTimersByTime(COMPANION_TIMING.petCooldown - COMPANION_TIMING.pettedDuration)
    expect(scheduler.pet()).toBe(true)
    scheduler.destroy()
  })

  it('postpones a major action until three seconds after typing', () => {
    const machine = new CompanionStateMachine()
    const scheduler = new CompanionScheduler({ machine, autonomousActivity: true, reducedMotion: false, clock: { random: () => 0 } })
    vi.advanceTimersByTime(COMPANION_TIMING.initialMajorMin - 500)
    scheduler.noteTyping()
    vi.advanceTimersByTime(500)
    expect(machine.state).toBe('resting')
    vi.advanceTimersByTime(COMPANION_TIMING.typingQuiet - 501)
    expect(machine.state).toBe('resting')
    vi.advanceTimersByTime(1)
    expect(machine.state).toBe('stretching')
    scheduler.destroy()
  })

  it('clears timers while paused, reduced, disabled, or destroyed', () => {
    const machine = new CompanionStateMachine()
    const scheduler = new CompanionScheduler({ machine, autonomousActivity: true, reducedMotion: false, clock: { random: () => 0 } })
    scheduler.setPaused(true)
    expect(machine.state).toBe('paused')
    vi.advanceTimersByTime(COMPANION_TIMING.stretchMax * 2)
    expect(machine.state).toBe('paused')
    scheduler.setPaused(false)
    expect(machine.state).toBe('resting')
    scheduler.setReducedMotion(true)
    expect(vi.getTimerCount()).toBe(0)
    expect(scheduler.pet()).toBe(true)
    scheduler.destroy()
    expect(vi.getTimerCount()).toBe(0)
  })
})
