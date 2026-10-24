import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES } from './src/theme/colors';
import {
  EmergencyContact,
  DetectionSettings,
  ActiveEmergency,
  TriggerCause,
} from './src/types';
import {
  INITIAL_CONTACTS,
  INITIAL_DETECTION_SETTINGS,
  storageService,
} from './src/services/storageService';
import { sensorService } from './src/services/sensorService';
import { soundService } from './src/services/soundService';

import { HomeScreen } from './src/screens/HomeScreen';
import { SmartDetectScreen } from './src/screens/SmartDetectScreen';
import { ContactsScreen } from './src/screens/ContactsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

import { EmergencyModal } from './src/components/EmergencyModal';
import { SosActiveModal } from './src/components/SosActiveModal';
import { FakeCallModal } from './src/components/FakeCallModal';
import { AddContactModal } from './src/components/AddContactModal';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => storageService.getStoredContacts());
  const [settings, setSettings] = useState<DetectionSettings>(INITIAL_DETECTION_SETTINGS);
  const [activeEmergency, setActiveEmergency] = useState<ActiveEmergency | null>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isSosBroadcastDispatched, setIsSosBroadcastDispatched] = useState(false);

  // Modals
  const [fakeCallVisible, setFakeCallVisible] = useState(false);
  const [addContactVisible, setAddContactVisible] = useState(false);

  // Initialize sensor engine with real-time detection & false-alarm timer
  useEffect(() => {
    sensorService.init(
      settings,
      (cause: TriggerCause, label: string) => {
        handleTriggerAnomaly(cause, label);
      }
    );

    return () => {
      sensorService.stopMonitoring();
    };
  }, [settings]);

  // Listen for hardware deep links (iOS Back Tap, Action Button, Siri Shortcuts, or widgets)
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes('sos')) {
        handleTriggerAnomaly(
          'hardware_back_tap',
          'Lock Screen Trigger (iOS Back Tap / Quick Shortcut)'
        );
      } else if (event.url.includes('escort')) {
        setActiveTab(3);
      }
    };

    const sub = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url && url.includes('sos')) {
        handleTriggerAnomaly(
          'hardware_back_tap',
          'Lock Screen Trigger (iOS Back Tap / Quick Shortcut)'
        );
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  // Trigger emergency countdown
  const handleTriggerAnomaly = (cause: TriggerCause, causeLabel: string) => {
    if (isEmergencyActive || isSosBroadcastDispatched) return;

    soundService.triggerHaptic('heavy');
    const newAlert: ActiveEmergency = {
      id: `alert-${Date.now()}`,
      timestamp: Date.now(),
      cause,
      causeLabel,
      initialCountdown: settings.countdownSeconds || 10,
      countdownRemaining: settings.countdownSeconds || 10,
      status: 'countdown',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 4,
        campusZone: 'Current Street Location • High-Accuracy GPS Fix',
      },
    };

    setActiveEmergency(newAlert);
    setIsEmergencyActive(true);
  };

  // User disarms the emergency (False Alarm)
  const handleDisarmSOS = () => {
    soundService.playSafeDisarmChime();
    setIsEmergencyActive(false);
    setActiveEmergency(null);
  };

  // Timer ran out or user skipped timer to dispatch immediately
  const handleDispatchImmediate = () => {
    soundService.triggerHaptic('heavy');
    if (settings.autoSiren) {
      soundService.startLoudSiren();
    }
    setIsEmergencyActive(false);
    setIsSosBroadcastDispatched(true);
  };

  // Resolve after live broadcast
  const handleResolveAlert = () => {
    soundService.stopLoudSiren();
    soundService.playSafeDisarmChime();
    setIsSosBroadcastDispatched(false);
    setActiveEmergency(null);
  };

  // Add new contact
  const handleAddContact = (newContact: EmergencyContact) => {
    setContacts((prev) => {
      const updated = [newContact, ...prev];
      storageService.saveStoredContacts(updated);
      return updated;
    });
  };

  // Delete contact
  const handleDeleteContact = (id: string) => {
    setContacts((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      storageService.saveStoredContacts(updated);
      return updated;
    });
  };

  // Toggle priority contact
  const handleTogglePriority = (id: string) => {
    setContacts((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, isPriority: !c.isPriority } : c));
      storageService.saveStoredContacts(updated);
      return updated;
    });
  };

  const navTabs = [
    { label: 'Shield', icon: 'shield' as const, activeIcon: 'shield' as const },
    { label: 'Sensors', icon: 'hardware-chip-outline' as const, activeIcon: 'hardware-chip' as const },
    { label: 'Contacts', icon: 'call-outline' as const, activeIcon: 'call' as const },
    { label: 'Profile', icon: 'person-outline' as const, activeIcon: 'person' as const },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {activeTab === 0 && (
          <HomeScreen
            onTriggerSOS={(cause, label) => handleTriggerAnomaly(cause, label)}
            onOpenFakeCall={() => setFakeCallVisible(true)}
            onNavigateToTab={(idx) => setActiveTab(idx)}
            isSensorArmed={settings.fallDetectionEnabled || settings.screamDetectionEnabled}
          />
        )}

        {activeTab === 1 && (
          <SmartDetectScreen
            settings={settings}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              sensorService.updateSettings(newSettings);
            }}
            onSimulateFall={() => sensorService.simulateFall()}
            onSimulateScream={() => sensorService.simulateScream()}
          />
        )}

        {activeTab === 2 && (
          <ContactsScreen
            contacts={contacts}
            onOpenAddContact={() => setAddContactVisible(true)}
            onDeleteContact={handleDeleteContact}
            onTogglePriority={handleTogglePriority}
          />
        )}

        {activeTab === 3 && <ProfileScreen />}
      </View>

      {/* Refined Floating Tactical Navigation Bar */}
      <View style={styles.navBarContainer}>
        <View style={styles.navBarSolid}>
          {navTabs.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <TouchableOpacity
                key={tab.label}
                activeOpacity={0.8}
                style={[styles.navTabItem, isActive && styles.navTabItemActive]}
                onPress={() => {
                  soundService.triggerHaptic('light');
                  setActiveTab(idx);
                }}
              >
                <View
                  style={[
                    styles.navIconContainer,
                    isActive && styles.navIconContainerActive,
                  ]}
                >
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={19}
                    color={isActive ? COLORS.textInverse : COLORS.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.navTabLabel,
                    isActive ? styles.navTabLabelActive : styles.navTabLabelInactive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Emergency Pre-SOS Countdown Modal */}
      <EmergencyModal
        visible={isEmergencyActive}
        emergency={activeEmergency}
        onCancelDisarm={handleDisarmSOS}
        onDispatchImmediate={handleDispatchImmediate}
      />

      {/* Active SOS Broadcast Screen */}
      <SosActiveModal
        visible={isSosBroadcastDispatched}
        emergency={activeEmergency}
        onResolve={handleResolveAlert}
      />

      {/* Fake Incoming Call Modal */}
      <FakeCallModal
        visible={fakeCallVisible}
        onClose={() => setFakeCallVisible(false)}
        callerName="Mom (Sarah Sterling)"
      />

      {/* Add Contact Modal */}
      <AddContactModal
        visible={addContactVisible}
        onClose={() => setAddContactVisible(false)}
        onAdd={handleAddContact}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
  },
  navBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 14,
    paddingTop: 8,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navBarSolid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 6,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  navTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 16,
  },
  navTabItemActive: {
    backgroundColor: COLORS.primaryBg,
  },
  navIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainerActive: {
    backgroundColor: COLORS.primary,
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  navTabLabelActive: {
    color: COLORS.primaryLighter,
    fontWeight: '800',
  },
  navTabLabelInactive: {
    color: COLORS.textMuted,
  },
});
