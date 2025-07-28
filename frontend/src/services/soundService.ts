class SoundService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.7;

  constructor() {
    this.initAudioContext();
    this.loadSounds();
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async loadSounds() {
    const soundFiles = {
      diceRoll: this.generateDiceRollSound(),
      buttonClick: this.generateButtonClickSound(),
      scoreSubmit: this.generateScoreSubmitSound(),
      kniffel: this.generateKniffelSound(),
      timerTick: this.generateTimerTickSound(),
      gameWin: this.generateGameWinSound(),
      elimination: this.generateEliminationSound()
    };

    for (const [name, audioBuffer] of Object.entries(soundFiles)) {
      if (audioBuffer) {
        this.sounds.set(name, audioBuffer);
      }
    }
  }

  private generateDiceRollSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 0.6;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() - 0.5) * 0.3;
      const rattle = Math.sin(t * 200 * Math.PI) * Math.exp(-t * 3) * 0.2;
      data[i] = noise + rattle;
    }

    return buffer;
  }

  private generateButtonClickSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const click = Math.sin(t * 800 * Math.PI) * Math.exp(-t * 20);
      data[i] = click * 0.3;
    }

    return buffer;
  }

  private generateScoreSubmitSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const tone1 = Math.sin(t * 440 * Math.PI) * Math.exp(-t * 3);
      const tone2 = Math.sin(t * 660 * Math.PI) * Math.exp(-t * 3);
      data[i] = (tone1 + tone2) * 0.2;
    }

    return buffer;
  }

  private generateKniffelSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 1.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const fanfare = Math.sin(t * 523 * Math.PI) * Math.exp(-t * 1) * 0.3 +
                     Math.sin(t * 659 * Math.PI) * Math.exp(-t * 1) * 0.3 +
                     Math.sin(t * 784 * Math.PI) * Math.exp(-t * 1) * 0.3;
      data[i] = fanfare;
    }

    return buffer;
  }

  private generateTimerTickSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 0.05;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const tick = Math.sin(t * 1000 * Math.PI) * Math.exp(-t * 50);
      data[i] = tick * 0.1;
    }

    return buffer;
  }

  private generateGameWinSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 2.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const melody = Math.sin(t * 523 * Math.PI) * Math.exp(-t * 0.5) * 0.2 +
                    Math.sin(t * 659 * Math.PI) * Math.exp(-(t - 0.3) * 0.5) * 0.2 +
                    Math.sin(t * 784 * Math.PI) * Math.exp(-(t - 0.6) * 0.5) * 0.2;
      data[i] = melody;
    }

    return buffer;
  }

  private generateEliminationSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 0.8;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const descending = Math.sin(t * (400 - t * 200) * Math.PI) * Math.exp(-t * 2);
      data[i] = descending * 0.3;
    }

    return buffer;
  }

  play(soundName: string) {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) {
      return;
    }

    const buffer = this.sounds.get(soundName)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

export const soundService = new SoundService();
export default soundService;
