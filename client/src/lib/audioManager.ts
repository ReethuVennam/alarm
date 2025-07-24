class AudioManager {
  private audioContext: AudioContext | null = null;
  private alarmSound: HTMLAudioElement | null = null;
  private isPlaying = false;
  private loopInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      // Create audio context for better control
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create alarm sound using Web Audio API
      this.createAlarmSound();
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio');
      this.createFallbackSound();
    }
  }

  private createAlarmSound() {
    // Create a simple alarm tone using Web Audio API
    const createTone = (frequency: number, duration: number) => {
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };

    // Create alarm pattern function
    this.playAlarmPattern = () => {
      if (!this.audioContext || !this.isPlaying) return;

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create alarm pattern: high-low-high-low
      createTone(800, 0.3);
      setTimeout(() => {
        if (this.isPlaying) createTone(600, 0.3);
      }, 400);
      setTimeout(() => {
        if (this.isPlaying) createTone(800, 0.3);
      }, 800);
      setTimeout(() => {
        if (this.isPlaying) createTone(600, 0.3);
      }, 1200);
    };
  }

  private createFallbackSound() {
    // Fallback to HTML5 Audio with data URI
    const audioData = this.generateAlarmTone();
    this.alarmSound = new Audio(audioData);
    this.alarmSound.loop = false;
    this.alarmSound.volume = 0.5;

    this.playAlarmPattern = () => {
      if (!this.alarmSound || !this.isPlaying) return;
      
      this.alarmSound.currentTime = 0;
      this.alarmSound.play().catch(console.error);
    };
  }

  private generateAlarmTone(): string {
    // Generate a simple alarm tone as data URI
    const sampleRate = 44100;
    const duration = 1.5;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(samples * 2);
    const view = new DataView(buffer);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Create alarm pattern with multiple frequencies
      if (t < 0.3) {
        sample = Math.sin(2 * Math.PI * 800 * t) * 0.3;
      } else if (t < 0.7) {
        sample = Math.sin(2 * Math.PI * 600 * t) * 0.3;
      } else if (t < 1.0) {
        sample = Math.sin(2 * Math.PI * 800 * t) * 0.3;
      } else {
        sample = Math.sin(2 * Math.PI * 600 * t) * 0.3;
      }

      // Apply fade out
      if (t > 1.2) {
        sample *= (1.5 - t) / 0.3;
      }

      const intSample = Math.floor(sample * 32767);
      view.setInt16(i * 2, intSample, true);
    }

    // Convert to WAV format
    const wavHeader = this.createWavHeader(buffer.byteLength, sampleRate);
    const wavBuffer = new ArrayBuffer(wavHeader.length + buffer.byteLength);
    const wavView = new Uint8Array(wavBuffer);
    
    wavView.set(new Uint8Array(wavHeader), 0);
    wavView.set(new Uint8Array(buffer), wavHeader.length);

    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private createWavHeader(dataLength: number, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    return buffer;
  }

  private playAlarmPattern: () => void = () => {};

  public playAlarm(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    
    // Play immediately
    this.playAlarmPattern();
    
    // Set up loop to repeat every 2 seconds
    this.loopInterval = setInterval(() => {
      if (this.isPlaying) {
        this.playAlarmPattern();
      }
    }, 2000);
  }

  public stopAlarm(): void {
    this.isPlaying = false;

    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    if (this.alarmSound) {
      this.alarmSound.pause();
      this.alarmSound.currentTime = 0;
    }
  }

  public isAlarmPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (this.alarmSound) {
      this.alarmSound.volume = clampedVolume;
    }
  }

  public async requestAudioPermission(): Promise<boolean> {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    } catch (error) {
      console.error('Failed to request audio permission:', error);
      return false;
    }
  }
}

export const audioManager = new AudioManager();
