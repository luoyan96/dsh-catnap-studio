import { describe, expect, it, vi } from 'vitest'
import { CompanionStateMachine } from '../src/client/companion/state-machine.ts'

describe('CompanionStateMachine', () => {
  it('prioritizes petted and paused states', () => {
    const machine = new CompanionStateMachine()
    const listener = vi.fn()
    machine.subscribe(listener)

    expect(machine.setAutonomous('stretching')).toBe(true)
    expect(machine.pet()).toBe(true)
    expect(machine.setAutonomous('playing-yarn')).toBe(false)
    expect(machine.pause()).toBe(true)
    expect(machine.pet()).toBe(false)
    expect(machine.resume()).toBe(true)
    expect(machine.state).toBe('resting')
    expect(listener).toHaveBeenCalledTimes(4)
  })
})
