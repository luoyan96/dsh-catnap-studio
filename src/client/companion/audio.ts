export interface CompanionAudioOptions {
  source: string
  enabled: boolean
  volume: number
  createAudio?: (source: string) => HTMLAudioElement
}

export class CompanionAudio {
  #audio: HTMLAudioElement | undefined
  #source: string
  #createAudio: (source: string) => HTMLAudioElement
  #enabled: boolean
  #volume: number

  constructor(options: CompanionAudioOptions) {
    this.#source = options.source
    this.#createAudio = options.createAudio ?? ((source) => new Audio(source))
    this.#enabled = options.enabled
    this.#volume = options.volume
  }

  configure(enabled: boolean, volume: number): void {
    this.#enabled = enabled
    this.#volume = Math.min(1, Math.max(0, volume))
    if (this.#audio !== undefined) this.#audio.volume = this.#volume
  }

  playPurr(): void {
    if (!this.#enabled) return
    try {
      if (this.#audio === undefined) {
        this.#audio = this.#createAudio(this.#source)
        this.#audio.preload = 'auto'
        this.#audio.volume = this.#volume
      }
      this.#audio.currentTime = 0
      const result = this.#audio.play()
      result?.catch(() => undefined)
    } catch {
      // Browser autoplay and media decoding failures must never affect interaction.
    }
  }

  dispose(): void {
    try {
      this.#audio?.pause()
      if (this.#audio !== undefined) this.#audio.currentTime = 0
    } catch {
      // Best-effort cleanup.
    }
    this.#audio = undefined
  }
}
