import type { CompanionState } from './types.ts'

export type CompanionStateListener = (state: CompanionState, previous: CompanionState) => void

export class CompanionStateMachine {
  #state: CompanionState = 'resting'
  #resumeState: CompanionState = 'resting'
  #listeners = new Set<CompanionStateListener>()

  get state(): CompanionState {
    return this.#state
  }

  subscribe(listener: CompanionStateListener): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  setAutonomous(state: Extract<CompanionState, 'resting' | 'sleeping' | 'stretching' | 'playing-yarn'>): boolean {
    if (this.#state === 'paused' || this.#state === 'petted') return false
    return this.#set(state)
  }

  pet(): boolean {
    if (this.#state === 'paused') return false
    return this.#set('petted')
  }

  settle(): boolean {
    if (this.#state === 'paused') return false
    return this.#set('resting')
  }

  pause(): boolean {
    if (this.#state === 'paused') return false
    this.#resumeState = this.#state === 'petted' ? 'resting' : this.#state
    return this.#set('paused')
  }

  resume(): boolean {
    if (this.#state !== 'paused') return false
    const next = this.#resumeState === 'stretching' || this.#resumeState === 'playing-yarn'
      ? 'resting'
      : this.#resumeState
    this.#resumeState = 'resting'
    return this.#set(next)
  }

  #set(next: CompanionState): boolean {
    if (next === this.#state) return false
    const previous = this.#state
    this.#state = next
    for (const listener of this.#listeners) listener(next, previous)
    return true
  }
}
