import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

class SoundService {
  private audioCtx: any = null;
  private sirenOsc: any = null;
  private sirenGain: any = null;
  private isSirenPlaying = false;
  private sirenInterval: any = null;

  private getAudioContext() {
    if (Platform.OS === 'web') {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && !this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }
    return this.audioCtx;
  }

  // Plays an urgent countdown tick/beep
  playCountdownBeep(urgencyRate: number = 1) {
    this.triggerHaptic('warning');
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800 + urgencyRate * 120, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Safe disarm chime (positive two-tone)
  playSafeDisarmChime() {
    this.triggerHaptic('success');
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.12);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch {
      // ignore audio error
    }
  }

  // Continuous high-decibel safety siren
  startLoudSiren() {
    if (this.isSirenPlaying) return;
    this.isSirenPlaying = true;
    this.triggerHaptic('heavy');

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.sirenOsc = ctx.createOscillator();
      this.sirenGain = ctx.createGain();
      this.sirenOsc.type = 'sawtooth';

      let high = false;
      this.sirenOsc.frequency.setValueAtTime(850, ctx.currentTime);
      this.sirenGain.gain.setValueAtTime(0.4, ctx.currentTime);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(ctx.destination);
      this.sirenOsc.start();

      this.sirenInterval = setInterval(() => {
        if (!this.isSirenPlaying || !ctx) return;
        high = !high;
        const targetFreq = high ? 1150 : 650;
        this.sirenOsc?.frequency?.cancelScheduledValues?.(ctx.currentTime);
        this.sirenOsc?.frequency?.linearRampToValueAtTime?.(targetFreq, ctx.currentTime + 0.25);
        this.triggerHaptic('medium');
      }, 300);
    } catch {
      // Audio autoplay policy
    }
  }

  stopLoudSiren() {
    this.isSirenPlaying = false;
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {}
      this.sirenOsc = null;
    }
  }

  isSirenActive() {
    return this.isSirenPlaying;
  }

  triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'warning' | 'success') {
    try {
      if (Platform.OS !== 'web') {
        if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        else if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Haptics not available on current hardware
    }
  }
}

export const soundService = new SoundService();
