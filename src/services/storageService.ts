import {
  EmergencyContact,
  StudentProfile,
  DetectionSettings,
  IncidentRecord,
} from '../types';

export const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-emergency-1',
    name: 'National Emergency Helpline',
    relationOrRole: 'Police & Emergency (Universal 112)',
    phone: '112',
    type: 'emergency',
    isPriority: true,
    departmentOrLocation: '24/7 Police & Dispatch Command',
    avatarColor: '#E24C52',
  },
  {
    id: 'contact-emergency-2',
    name: 'Women Distress Helpline',
    relationOrRole: 'Dedicated Women Safety (1091)',
    phone: '1091',
    type: 'emergency',
    isPriority: true,
    departmentOrLocation: 'National Women Safety Cell',
    avatarColor: '#DCA148',
  },
  {
    id: 'contact-family-1',
    name: 'Mom (Primary Guardian)',
    relationOrRole: 'Mother / Primary Contact',
    phone: '+1 (555) 234-8901',
    type: 'family',
    isPriority: true,
    departmentOrLocation: 'Home',
    avatarColor: '#A58D6D',
  },
  {
    id: 'contact-friend-1',
    name: 'Aria (Best Friend)',
    relationOrRole: 'Close Friend / Roommate',
    phone: '+1 (555) 456-7890',
    type: 'friend',
    isPriority: false,
    departmentOrLocation: 'Nearby',
    avatarColor: '#B8977E',
  },
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Maya Sterling',
  studentId: 'EMERGENCY-CARD-2026',
  universityName: 'Personal Safety Shield',
  campusCampus: 'Downtown Metro Area',
  dormRoom: 'Apartment 4B, Maple Avenue',
  bloodGroup: 'O+ Positive',
  phone: '+1 (555) 901-4433',
  emergencyNotes: 'Allergic to Penicillin. Mild asthma (inhaler kept in purse).',
  homeAddress: 'Apartment 4B, Maple Avenue',
};

export const INITIAL_DETECTION_SETTINGS: DetectionSettings = {
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

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'inc-1',
    date: 'Yesterday',
    time: '09:42 PM',
    causeLabel: 'False Alarm - Dropped Bag (Fall Test)',
    status: 'Safely Cancelled (False Alarm)',
    location: 'Metro Central Walkway',
  },
  {
    id: 'inc-2',
    date: 'Sep 24, 2026',
    time: '11:15 PM',
    causeLabel: 'Night Walk Safe Arrival Check-in',
    status: 'Resolved with Guardians',
    location: 'Oak Street to Maple Avenue',
  },
];

// Persistent contacts helper with local storage fallback
const CONTACTS_STORAGE_KEY = 'safe_route_plus_contacts_v1';
const LEGACY_STORAGE_KEY = 'girls_safety_contacts_v1';

export const storageService = {
  getStoredContacts: (): EmergencyContact[] => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored =
          window.localStorage.getItem(CONTACTS_STORAGE_KEY) ||
          window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CONTACTS;
  },

  saveStoredContacts: (contacts: EmergencyContact[]): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
      }
    } catch {
      // Fallback
    }
  },
};
