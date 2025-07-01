class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API not supported", error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume: number = 0.1,
  ) {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Resume context if suspended
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime,
      );
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Failed to play tone:", error);
    }
  }

  // Game-specific sound effects
  async playButtonClick() {
    await this.playTone(800, 0.1, "square", 0.05);
  }

  async playChoice() {
    await this.playTone(600, 0.15, "sine", 0.08);
  }

  async playWin() {
    // Victory fanfare
    await this.playTone(523, 0.2, "triangle", 0.1); // C5
    setTimeout(() => this.playTone(659, 0.2, "triangle", 0.1), 100); // E5
    setTimeout(() => this.playTone(784, 0.3, "triangle", 0.1), 200); // G5
  }

  async playLose() {
    // Descending tones
    await this.playTone(400, 0.3, "sawtooth", 0.08);
    setTimeout(() => this.playTone(350, 0.3, "sawtooth", 0.08), 150);
    setTimeout(() => this.playTone(300, 0.4, "sawtooth", 0.08), 300);
  }

  async playTie() {
    await this.playTone(440, 0.2, "triangle", 0.06);
    setTimeout(() => this.playTone(440, 0.2, "triangle", 0.06), 200);
  }

  async playCountdown() {
    await this.playTone(1000, 0.1, "square", 0.05);
  }

  async playGameStart() {
    // Rising melody
    await this.playTone(440, 0.1, "sine", 0.08); // A4
    setTimeout(() => this.playTone(523, 0.1, "sine", 0.08), 100); // C5
    setTimeout(() => this.playTone(659, 0.2, "sine", 0.08), 200); // E5
  }

  async playConnection() {
    await this.playTone(880, 0.1, "triangle", 0.06);
    setTimeout(() => this.playTone(1108, 0.1, "triangle", 0.06), 100);
  }

  async playDisconnection() {
    await this.playTone(440, 0.2, "sawtooth", 0.06);
    setTimeout(() => this.playTone(220, 0.3, "sawtooth", 0.06), 150);
  }
}

export const soundManager = new SoundManager();
