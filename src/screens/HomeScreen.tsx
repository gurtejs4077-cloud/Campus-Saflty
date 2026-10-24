import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES, SPACING } from '../theme/colors';
import { Header } from '../components/Header';
import { soundService } from '../services/soundService';

interface HomeScreenProps {
  onTriggerSOS: (cause: 'manual_button', label: string) => void;
  onOpenFakeCall: () => void;
  onNavigateToTab: (tabIndex: number) => void;
  isSensorArmed: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onTriggerSOS,
  onOpenFakeCall,
  onNavigateToTab,
  isSensorArmed,
}) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);

  const handleSOSPress = () => {
    soundService.triggerHaptic('heavy');
    onTriggerSOS('manual_button', 'Manual SOS Triggered');
  };

  const toggleSiren = () => {
    if (sirenPlaying) {
      soundService.stopLoudSiren();
      setSirenPlaying(false);
    } else {
      soundService.startLoudSiren();
      setSirenPlaying(true);
    }
  };

  const toggleStrobe = () => {
    soundService.triggerHaptic('medium');
    setStrobeActive(!strobeActive);
  };

  const handleCallPatrol = () => {
    Linking.openURL('tel:112');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Emergency Shield"
        subtitle="PERSONAL SAFETY GUARDIAN"
        isArmed={isSensorArmed}
        onQuickAlertPress={handleSOSPress}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Pill Strip */}
        <View style={styles.pillStrip}>
          <View style={styles.statusPill}>
            <View style={[styles.pillDot, { backgroundColor: COLORS.safeGreen }]} />
            <Text style={styles.pillText}>PROTECTION ACTIVE</Text>
          </View>
          <View style={styles.statusPill}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
            <Text style={styles.pillText}>BG GUARD ACTIVE</Text>
          </View>
          <View style={styles.statusPill}>
            <Ionicons name="location" size={13} color={COLORS.primary} />
            <Text style={styles.pillText}>GPS READY</Text>
          </View>
        </View>

        {/* Central Giant Solid SOS Hero Unit */}
        <View style={styles.sosContainer}>
          <View style={styles.outerRing}>
            <View style={styles.middleRing}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.sosCircleButton}
                onPress={handleSOSPress}
              >
                <Ionicons name="alert" size={38} color={COLORS.white} />
                <Text style={styles.sosButtonText}>SOS</Text>
                <Text style={styles.sosSubButtonText}>PRESS FOR HELP</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.disarmNoticePill}>
            <Ionicons name="timer-outline" size={14} color={COLORS.warningAmber} />
            <Text style={styles.disarmNoticeText}>
              Triggers a 10s countdown to cancel false alarms
            </Text>
          </View>
        </View>

        {/* Smart Guardian Status Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.guardianBanner}
          onPress={() => onNavigateToTab(1)}
        >
          <View style={styles.guardianIconCircle}>
            <Ionicons name="hardware-chip-outline" size={20} color={COLORS.safeGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.guardianTitleRow}>
              <Text style={styles.guardianTitle}>Smart Anomaly Detection</Text>
              <View style={styles.activeDotBadge}>
                <Text style={styles.activeDotText}>ARMED</Text>
              </View>
            </View>
            <Text style={styles.guardianSub}>
              Detects sudden falls, distress audio & stillness • Tap to test
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primaryLight} />
        </TouchableOpacity>

        {/* Quick Tactical Action Solid Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>QUICK SAFETY TOOLS</Text>
        </View>

        <View style={styles.actionGrid}>
          {/* Siren Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.toolCard,
              sirenPlaying ? styles.toolCardActiveSiren : styles.toolCardNormal,
            ]}
            onPress={toggleSiren}
          >
            <View
              style={[
                styles.toolIconBox,
                { backgroundColor: sirenPlaying ? COLORS.sosRed : COLORS.sosRedBg },
              ]}
            >
              <Ionicons
                name={sirenPlaying ? 'volume-mute' : 'megaphone'}
                size={22}
                color={sirenPlaying ? COLORS.white : COLORS.sosRed}
              />
            </View>
            <Text style={styles.toolTitle}>110dB Alarm</Text>
            <Text style={styles.toolSub}>
              {sirenPlaying ? 'Siren blasting!' : 'High-pitch siren'}
            </Text>
          </TouchableOpacity>

          {/* Fake Call Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.toolCard, styles.toolCardNormal]}
            onPress={onOpenFakeCall}
          >
            <View style={[styles.toolIconBox, { backgroundColor: COLORS.primaryBg }]}>
              <Ionicons name="call" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.toolTitle}>Fake Rescue Call</Text>
            <Text style={styles.toolSub}>Simulate incoming call</Text>
          </TouchableOpacity>

          {/* Flashlight Strobe */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.toolCard,
              strobeActive ? styles.toolCardActiveStrobe : styles.toolCardNormal,
            ]}
            onPress={toggleStrobe}
          >
            <View
              style={[
                styles.toolIconBox,
                { backgroundColor: strobeActive ? COLORS.warningAmber : COLORS.warningAmberBg },
              ]}
            >
              <Ionicons
                name="flashlight"
                size={22}
                color={strobeActive ? COLORS.textInverse : COLORS.warningAmber}
              />
            </View>
            <Text style={styles.toolTitle}>Flash Strobe</Text>
            <Text style={styles.toolSub}>{strobeActive ? 'Strobing on' : 'Disorient threat'}</Text>
          </TouchableOpacity>

          {/* Guardian Contacts */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.toolCard, styles.toolCardNormal]}
            onPress={() => onNavigateToTab(2)}
          >
            <View style={[styles.toolIconBox, { backgroundColor: COLORS.escortPurpleBg }]}>
              <Ionicons name="people" size={22} color={COLORS.escortPurple} />
            </View>
            <Text style={styles.toolTitle}>SOS Contacts</Text>
            <Text style={styles.toolSub}>Call & SMS guardians</Text>
          </TouchableOpacity>
        </View>

        {/* 24/7 Emergency Services Direct Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.patrolBanner}
          onPress={handleCallPatrol}
        >
          <View style={styles.patrolIconCircle}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patrolTitle}>National Emergency & Police (112)</Text>
            <Text style={styles.patrolSub}>24/7 Rapid Police, Women Distress & Medical Desk</Text>
          </View>
          <View style={styles.callBadge}>
            <Text style={styles.callBadgeText}>CALL 112</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  pillStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: SHAPES.roundedPill,
    gap: 6,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  outerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(226, 76, 82, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 76, 82, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: 'rgba(226, 76, 82, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(226, 76, 82, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCircleButton: {
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: COLORS.sosRed,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.sosRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  sosButtonText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 30,
    letterSpacing: 1.5,
    marginTop: -2,
  },
  sosSubButtonText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 2,
  },
  disarmNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: SHAPES.roundedPill,
    marginTop: 14,
    gap: 7,
  },
  disarmNoticeText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  guardianBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 14,
    gap: 12,
  },
  guardianIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.safeGreenBg,
    borderWidth: 1,
    borderColor: COLORS.safeGreenBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardianTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guardianTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  activeDotBadge: {
    backgroundColor: COLORS.safeGreenBg,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: SHAPES.roundedPill,
    borderWidth: 1,
    borderColor: COLORS.safeGreenBorder,
  },
  activeDotText: {
    color: COLORS.safeGreen,
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  guardianSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    padding: 14,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    gap: 6,
    minHeight: 118,
    justifyContent: 'space-between',
  },
  toolCardNormal: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
  },
  toolCardActiveSiren: {
    backgroundColor: COLORS.sosRedBg,
    borderColor: COLORS.sosRed,
  },
  toolCardActiveStrobe: {
    backgroundColor: COLORS.warningAmberBg,
    borderColor: COLORS.warningAmber,
  },
  toolIconBox: {
    width: 40,
    height: 40,
    borderRadius: SHAPES.roundedBlock,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    marginTop: 4,
  },
  toolSub: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  patrolBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    padding: 14,
    gap: 12,
    marginTop: 2,
  },
  patrolIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patrolTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  patrolSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  callBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SHAPES.roundedPill,
  },
  callBadgeText: {
    color: COLORS.textInverse,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
