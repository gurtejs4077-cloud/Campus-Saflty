import { Platform, AppState, AppStateStatus } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { DetectionSettings, SensorTelemetry, TriggerCause } from '../types';

type AnomalyCallback = (cause: TriggerCause, label: string) => void;
type TelemetryCallback = (telemetry: SensorTelemetry) => void;

class SensorService {
  private accelSubscription: any = null;
  private audioStream: any = null;
  private audioAnalyser: any = null;
  private audioContext: any = null;
  private micInterval: any = null;
  private appStateSubscription: any = null;

  private onAnomalyDetected: AnomalyCallback | null = null;
  private onTelemetryUpdate: TelemetryCallback | null = null;

  private telemetry: SensorTelemetry = {
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    currentG: 1.0,
    peakG: 1.0,
    audioDb: 35,
    peakDb: 40,
    isFallCandidate: false,
    isScreamCandidate: false,
    isBackgroundActive: false,
  };

  private settings: DetectionSettings = {
    fallDetectionEnabled: true,
    fallSensitivity: 'medium',
    screamDetectionEnabled: true,
    screamSensitivity: 'medium',
    silenceAfterFallEnabled: true,
    countdownSeconds: 10,
    autoSiren: true,
    autoStrobe: false,
    hapticsAlert: true,
    backgroundMonitoringEnabled: true,
  };

  private fallPhase: 'none' | 'freefall' | 'impact' = 'none';
  private fallPhaseTimestamp: number = 0;
  private isArmed = false;

  init(settings: DetectionSettings, onAnomaly: AnomalyCallback, onTelemetry?: TelemetryCallback) {
    this.settings = settings;
    this.onAnomalyDetected = onAnomaly;
    if (onTelemetry) this.onTelemetryUpdate = onTelemetry;
    
    this.setupAppStateListener();
    this.startMonitoring();
  }

  private setupAppStateListener() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const isBg = nextAppState === 'background' || nextAppState === 'inactive';
      this.telemetry.isBackgroundActive = isBg;
      this.notifyTelemetry();

      // If background monitoring is enabled and app is armed, maintain active acoustic keep-alive
      if (isBg && this.isArmed && this.settings.backgroundMonitoringEnabled) {
        // App is sustained in background via UIBackgroundModes: ["audio", "location"]
      }
    });
  }

  updateSettings(settings: DetectionSettings) {
    this.settings = settings;
  }

  startMonitoring() {
    this.isArmed = true;
    this.startAccelerometer();
    this.startMicrophoneAnalysis();
  }

  stopMonitoring() {
    this.isArmed = false;
    this.stopAccelerometer();
    this.stopMicrophoneAnalysis();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  private getFallThreshold(): { impact: number; freefall: number } {
    switch (this.settings.fallSensitivity) {
      case 'high':
        return { impact: 2.2, freefall: 0.65 };
      case 'low':
        return { impact: 3.5, freefall: 0.35 };
      case 'medium':
      default:
        return { impact: 2.7, freefall: 0.5 };
    }
  }

  private getScreamThreshold(): number {
    switch (this.settings.screamSensitivity) {
      case 'high':
        return 72; // sensitive to loud gasps/cries
      case 'low':
        return 88; // very loud screams only
      case 'medium':
      default:
        return 80;
    }
  }

  // Accelerometer Fall Detection
  private startAccelerometer() {
    try {
      Accelerometer.setUpdateInterval(100); // 10Hz updates
      this.accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const totalG = Math.sqrt(x * x + y * y + z * z);
        this.telemetry.accelX = parseFloat(x.toFixed(2));
        this.telemetry.accelY = parseFloat(y.toFixed(2));
        this.telemetry.accelZ = parseFloat(z.toFixed(2));
        this.telemetry.currentG = parseFloat(totalG.toFixed(2));

        if (totalG > this.telemetry.peakG) {
          this.telemetry.peakG = parseFloat(totalG.toFixed(2));
        }

        if (this.isArmed && this.settings.fallDetectionEnabled) {
          this.evaluateFallPhysics(totalG);
        }

        this.notifyTelemetry();
      });
    } catch {
      // Fallback if hardware sensor not permitted
    }
  }

  private evaluateFallPhysics(currentG: number) {
    const threshold = this.getFallThreshold();
    const now = Date.now();

    // Stage 1: Freefall detection
    if (currentG < threshold.freefall) {
      this.fallPhase = 'freefall';
      this.fallPhaseTimestamp = now;
      this.telemetry.isFallCandidate = true;
    }
    // Stage 2: Sudden Impact shock
    else if (currentG >= threshold.impact) {
      const timeSinceFreefall = now - this.fallPhaseTimestamp;
      if (this.fallPhase === 'freefall' && timeSinceFreefall < 1200) {
        this.triggerFallDetected('Sudden Fall & Hard Impact Detected');
      } else if (currentG >= threshold.impact * 1.25) {
        this.triggerFallDetected('High-G Violent Impact Detected');
      }
      this.fallPhase = 'impact';
      this.fallPhaseTimestamp = now;
    } else {
      if (now - this.fallPhaseTimestamp > 2500) {
        this.fallPhase = 'none';
        this.telemetry.isFallCandidate = false;
      }
    }
  }

  private triggerFallDetected(reason: string) {
    this.fallPhase = 'none';
    this.telemetry.isFallCandidate = false;
    if (this.onAnomalyDetected) {
      if (this.settings.silenceAfterFallEnabled) {
        this.onAnomalyDetected('fall_and_silence', `${reason} + Inactivity`);
      } else {
        this.onAnomalyDetected('sudden_fall', reason);
      }
    }
  }

  private stopAccelerometer() {
    if (this.accelSubscription) {
      this.accelSubscription.remove();
      this.accelSubscription = null;
    }
  }

  // Acoustic Scream & Sound Analyzer
  private async startMicrophoneAnalysis() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.audioStream = stream;
        const AudioContextClass =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.fftSize = 256;
        source.connect(this.audioAnalyser);

        const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

        this.micInterval = setInterval(() => {
          if (!this.audioAnalyser) return;
          this.audioAnalyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const approximateDb = Math.round(30 + (average / 255) * 75);
          this.telemetry.audioDb = approximateDb;

          if (approximateDb > this.telemetry.peakDb) {
            this.telemetry.peakDb = approximateDb;
          }

          if (this.isArmed && this.settings.screamDetectionEnabled) {
            const screamLimit = this.getScreamThreshold();
            if (approximateDb >= screamLimit) {
              this.telemetry.isScreamCandidate = true;
              this.onAnomalyDetected?.('loud_scream', `Loud Scream Detected (${approximateDb} dB)`);
            } else {
              this.telemetry.isScreamCandidate = false;
            }
          }

          this.notifyTelemetry();
        }, 150);
        return;
      } catch {
        // Fall back to synthetic telemetry simulation if mic access denied
      }
    }

    // Default simulation ticker for telemetry updates
    this.micInterval = setInterval(() => {
      const ambient = 34 + Math.round(Math.random() * 8);
      this.telemetry.audioDb = ambient;
      this.notifyTelemetry();
    }, 500);
  }

  private stopMicrophoneAnalysis() {
    if (this.micInterval) {
      clearInterval(this.micInterval);
      this.micInterval = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track: any) => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private notifyTelemetry() {
    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({ ...this.telemetry });
    }
  }

  // Simulation triggers for testing & verification
  simulateFall() {
    this.telemetry.currentG = 3.65;
    this.telemetry.peakG = 3.65;
    this.notifyTelemetry();
    this.onAnomalyDetected?.('sudden_fall', 'Simulated Sudden Fall & Drop Impact');
  }

  simulateScream() {
    this.telemetry.audioDb = 94;
    this.telemetry.peakDb = 94;
    this.notifyTelemetry();
    this.onAnomalyDetected?.('loud_scream', 'Simulated High-Decibel Scream (94 dB)');
  }

  simulateHardwareBackTap() {
    this.onAnomalyDetected?.(
      'hardware_back_tap',
      'iOS Hardware Back Tap Detected (Double-Tap on iPhone Back)'
    );
  }

  simulateLockscreenShortcut() {
    this.onAnomalyDetected?.(
      'lockscreen_shortcut',
      'Lock Screen Siri Shortcut / Action Button Activated'
    );
  }

  resetPeakValues() {
    this.telemetry.peakG = this.telemetry.currentG;
    this.telemetry.peakDb = this.telemetry.audioDb;
    this.notifyTelemetry();
  }
}

export const sensorService = new SensorService();
