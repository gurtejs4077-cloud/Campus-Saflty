import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES, SPACING } from '../theme/colors';
import { ActiveEmergency } from '../types';
import { soundService } from '../services/soundService';

interface SosActiveModalProps {
  visible: boolean;
  emergency: ActiveEmergency | null;
  onResolve: () => void;
}

export const SosActiveModal: React.FC<SosActiveModalProps> = ({
  visible,
  emergency,
  onResolve,
}) => {
  const [sirenOn, setSirenOn] = useState(false);

  useEffect(() => {
    if (visible) {
      soundService.triggerHaptic('heavy');
    } else {
      soundService.stopLoudSiren();
      setSirenOn(false);
    }
  }, [visible]);

  const toggleSiren = () => {
    if (sirenOn) {
      soundService.stopLoudSiren();
      setSirenOn(false);
    } else {
      soundService.startLoudSiren();
      setSirenOn(true);
    }
  };

  const handleCallSecurity = () => {
    Linking.openURL('tel:112');
  };

  const handleCall911 = () => {
    Linking.openURL('tel:112');
  };

  if (!visible || !emergency) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Beacon Alert Header */}
          <View style={styles.beaconHeader}>
            <View style={styles.blinkingDot} />
            <Text style={styles.beaconTitle}>DISTRESS SIGNAL BROADCASTING</Text>
          </View>

          {/* Core Status Card */}
          <View style={styles.alertCard}>
            <View style={styles.alertHeaderRow}>
              <View style={styles.sosPill}>
                <Ionicons name="radio" size={15} color={COLORS.white} />
                <Text style={styles.sosPillText}>LIVE DISTRESS ACTIVE</Text>
              </View>
              <Text style={styles.timerStamp}>Trigger: {emergency.causeLabel}</Text>
            </View>

            <Text style={styles.cardMainHeading}>Emergency Request Sent to Guardians & Helplines</Text>

            <View style={styles.statusTimeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]} />
                <Text style={styles.timelineText}>Emergency Services Helpline (112) Prepared</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]} />
                <Text style={styles.timelineText}>Automated Distress SMS Sent to Priority Contacts</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]} />
                <Text style={styles.timelineText}>Live GPS Tracking Beacon Transmitting</Text>
              </View>
            </View>
          </View>

          {/* Location Info Box */}
          <View style={styles.locationBox}>
            <View style={styles.locHeader}>
              <Ionicons name="location" size={17} color={COLORS.primary} />
              <Text style={styles.locTitle}>BROADCASTED GPS POSITION</Text>
            </View>
            <Text style={styles.campusZoneName}>Active Location • High-Accuracy GPS Fix</Text>
            <Text style={styles.gpsCoords}>
              Coordinates: {emergency.location.latitude.toFixed(5)}° N, {emergency.location.longitude.toFixed(5)}° W (±4m)
            </Text>
          </View>

          {/* High Priority Actions */}
          <View style={styles.actionGrid}>
            {/* Siren Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, sirenOn ? styles.sirenActiveBtn : styles.sirenIdleBtn]}
              onPress={toggleSiren}
            >
              <Ionicons
                name={sirenOn ? 'volume-mute' : 'megaphone'}
                size={24}
                color={sirenOn ? COLORS.textInverse : COLORS.warningAmber}
              />
              <Text style={[styles.actionBtnText, sirenOn && { color: COLORS.textInverse }]}>
                {sirenOn ? 'STOP SIREN' : 'LOUD 110dB SIREN'}
              </Text>
              <Text style={[styles.actionBtnSub, sirenOn && { color: 'rgba(0,0,0,0.7)' }]}>
                {sirenOn ? 'Siren blasting now' : 'Attract nearby emergency help'}
              </Text>
            </TouchableOpacity>

            {/* Direct Emergency Helpline Call */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.callSecurityBtn]}
              onPress={handleCallSecurity}
            >
              <Ionicons name="call" size={24} color={COLORS.textInverse} />
              <Text style={[styles.actionBtnText, { color: COLORS.textInverse }]}>CALL 112 DIRECT</Text>
              <Text style={[styles.actionBtnSub, { color: 'rgba(19, 18, 17, 0.75)' }]}>Police & Emergency Desk</Text>
            </TouchableOpacity>
          </View>

          {/* Direct Emergency Helpline */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.callPoliceBtn}
            onPress={handleCall911}
          >
            <Ionicons name="shield" size={17} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.callPoliceText}>CALL NATIONAL EMERGENCY (112 / 1091)</Text>
          </TouchableOpacity>

          {/* Safe Resolution Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.resolveBtn}
            onPress={() => {
              soundService.stopLoudSiren();
              onResolve();
            }}
          >
            <Ionicons name="checkmark-circle" size={22} color={COLORS.white} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.resolveTitle}>I AM SAFE NOW • RESOLVE ALERT</Text>
              <Text style={styles.resolveSub}>Confirm safety and stand down emergency dispatch</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 18, 17, 0.98)',
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sosRedBg,
    borderWidth: 1,
    borderColor: COLORS.sosRedBorder,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: SHAPES.roundedPill,
    gap: 8,
  },
  blinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.sosRed,
  },
  beaconTitle: {
    color: COLORS.sosRed,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  alertCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.sosRedBorder,
    padding: 16,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sosRed,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: SHAPES.roundedPill,
    gap: 6,
  },
  sosPillText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 11,
  },
  timerStamp: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  cardMainHeading: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
  },
  statusTimeline: {
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineDotDone: {
    backgroundColor: COLORS.safeGreen,
  },
  timelineText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  locationBox: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
  },
  locHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locTitle: {
    color: COLORS.primaryLight,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.7,
  },
  campusZoneName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  gpsCoords: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  actionGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  sirenActiveBtn: {
    backgroundColor: COLORS.warningAmber,
    borderColor: COLORS.warningAmberDark,
  },
  sirenIdleBtn: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
  },
  callSecurityBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  actionBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  actionBtnSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  callPoliceBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.sosRed,
    paddingVertical: 14,
    borderRadius: SHAPES.roundedButton,
    borderWidth: 1,
    borderColor: COLORS.sosRedDark,
  },
  callPoliceText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  resolveBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.safeGreen,
    borderWidth: 1,
    borderColor: COLORS.safeGreenDark,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: SHAPES.roundedCard,
  },
  resolveTitle: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 15,
  },
  resolveSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11,
    marginTop: 2,
  },
});
