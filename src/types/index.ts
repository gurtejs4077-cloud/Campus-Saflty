export type ContactType = 'family' | 'friend' | 'emergency';

export interface EmergencyContact {
  id: string;
  name: string;
  relationOrRole: string;
  phone: string;
  type: ContactType;
  isPriority: boolean;
  departmentOrLocation?: string;
  avatarColor?: string;
}

export interface StudentProfile {
  name: string;
  studentId: string;
  universityName: string;
  campusCampus: string;
  dormRoom: string;
  bloodGroup: string;
  phone: string;
  emergencyNotes: string;
  homeAddress?: string;
}

export type SensitivityLevel = 'low' | 'medium' | 'high';

export interface DetectionSettings {
  fallDetectionEnabled: boolean;
  fallSensitivity: SensitivityLevel;
  screamDetectionEnabled: boolean;
  screamSensitivity: SensitivityLevel;
  silenceAfterFallEnabled: boolean;
  countdownSeconds: number; // e.g. 10 or 15
  autoSiren: boolean;
  autoStrobe: boolean;
  hapticsAlert: boolean;
  backgroundMonitoringEnabled?: boolean;
}

export interface SensorTelemetry {
  accelX: number;
  accelY: number;
  accelZ: number;
  currentG: number;
  peakG: number;
  audioDb: number;
  peakDb: number;
  isFallCandidate: boolean;
  isScreamCandidate: boolean;
  isBackgroundActive?: boolean;
}

export type TriggerCause = 
  | 'manual_button'
  | 'sudden_fall'
  | 'loud_scream'
  | 'fall_and_silence'
  | 'escort_timeout'
  | 'hardware_back_tap'
  | 'lockscreen_shortcut';

export interface ActiveEmergency {
  id: string;
  timestamp: number;
  cause: TriggerCause;
  causeLabel: string;
  countdownRemaining: number;
  initialCountdown: number;
  status: 'countdown' | 'dispatched' | 'cancelled';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    campusZone: string;
  };
}

export interface IncidentRecord {
  id: string;
  date: string;
  time: string;
  causeLabel: string;
  status: 'Dispatched to Emergency Services' | 'Safely Cancelled (False Alarm)' | 'Resolved with Guardians';
  location: string;
}
