import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES } from '../theme/colors';
import { ActiveEmergency } from '../types';
import { soundService } from '../services/soundService';

interface EmergencyModalProps {
  visible: boolean;
  emergency: ActiveEmergency | null;
  onCancelDisarm: () => void;
  onDispatchImmediate: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  visible,
  emergency,
  onCancelDisarm,
  onDispatchImmediate,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (visible && emergency) {
      setSecondsLeft(emergency.countdownRemaining || emergency.initialCountdown || 10);

      // Start pulsing animation
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.06,
              duration: 450,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 450,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ringAnim, {
              toValue: 1.25,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(ringAnim, {
              toValue: 0.9,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // Countdown ticker
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            onDispatchImmediate();
            return 0;
          }
          // Play urgent ticking sound and haptic
          soundService.playCountdownBeep(11 - prev);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, emergency]);

  if (!visible || !emergency) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Urgent Warning Header Banner */}
        <View style={styles.hazardHeader}>
          <Ionicons name="warning" size={18} color={COLORS.white} />
          <Text style={styles.hazardHeaderText}>EMERGENCY VERIFICATION TIMER</Text>
        </View>

        {/* Cause Pill Badge */}
        <View style={styles.causeContainer}>
          <View style={styles.causePill}>
            <Ionicons
              name={
                emergency.cause === 'sudden_fall' || emergency.cause === 'fall_and_silence'
                  ? 'body'
                  : emergency.cause === 'loud_scream'
                  ? 'volume-high'
                  : emergency.cause === 'hardware_back_tap'
                  ? 'hand-left'
                  : emergency.cause === 'lockscreen_shortcut'
                  ? 'phone-portrait'
                  : 'alert-circle'
              }
              size={18}
              color={COLORS.sosRed}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.causeLabel}>{emergency.causeLabel.toUpperCase()}</Text>
          </View>
          <Text style={styles.subAlertText}>
            Phone registered an acute anomaly. If this was accidental, tap the green button below to disarm.
          </Text>
        </View>

        {/* Central Giant Countdown Timer Shape */}
        <View style={styles.counterCenter}>
          <Animated.View
            style={[
              styles.pulsingHalo,
              {
                transform: [{ scale: ringAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.counterSolidCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.counterNumber}>{secondsLeft}</Text>
            <Text style={styles.counterSecLabel}>SECONDS</Text>
          </Animated.View>
        </View>

        {/* Live Dispatch Target Card */}
        <View style={styles.targetCard}>
          <View style={styles.targetRow}>
            <View style={styles.targetIconBox}>
              <Ionicons name="navigate-circle" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.targetTitle}>Auto-Dispatch Alert Package</Text>
              <Text style={styles.targetDesc}>
                Live GPS • Distress Audio • Safety ID: #8849-2026
              </Text>
            </View>
          </View>
          <View style={styles.targetTags}>
            <View style={styles.tagSolid}>
              <Text style={styles.tagText}>Emergency (112)</Text>
            </View>
            <View style={styles.tagSolid}>
              <Text style={styles.tagText}>Primary Guardian</Text>
            </View>
            <View style={styles.tagSolid}>
              <Text style={styles.tagText}>Priority Contacts</Text>
            </View>
          </View>
        </View>

        {/* Disarm & Immediate Dispatch Controls */}
        <View style={styles.actionBlock}>
          {/* Main Disarm Button (Highlighted prominently for false alarms) */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.disarmButton}
            onPress={onCancelDisarm}
          >
            <Ionicons name="shield-checkmark" size={24} color={COLORS.white} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.disarmTitle}>I AM SAFE • CANCEL SOS</Text>
              <Text style={styles.disarmSubtitle}>Tap to prevent false alarm dispatch</Text>
            </View>
          </TouchableOpacity>

          {/* Immediate Dispatch Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dispatchNowButton}
            onPress={onDispatchImmediate}
          >
            <Ionicons name="flash" size={16} color={COLORS.sosRed} style={{ marginRight: 6 }} />
            <Text style={styles.dispatchNowText}>I NEED HELP NOW (SKIP TIMER)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 18, 17, 0.96)',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 36,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sosRed,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: SHAPES.roundedPill,
    gap: 8,
  },
  hazardHeaderText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  causeContainer: {
    alignItems: 'center',
    marginTop: 14,
  },
  causePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.sosRedBorder,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SHAPES.roundedPill,
    marginBottom: 10,
  },
  causeLabel: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.4,
  },
  subAlertText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  counterCenter: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  pulsingHalo: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(226, 76, 82, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(226, 76, 82, 0.45)',
  },
  counterSolidCircle: {
    width: 166,
    height: 166,
    borderRadius: 83,
    backgroundColor: COLORS.sosRed,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.sosRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  counterNumber: {
    fontSize: 66,
    fontWeight: '900',
    color: COLORS.white,
    lineHeight: 72,
  },
  counterSecLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.92)',
    letterSpacing: 1.2,
    marginTop: -4,
  },
  targetCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 16,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  targetIconBox: {
    width: 36,
    height: 36,
    borderRadius: SHAPES.roundedBlock,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  targetTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  targetDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  targetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagSolid: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SHAPES.roundedBlock,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  actionBlock: {
    width: '100%',
    gap: 10,
  },
  disarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.safeGreen,
    borderWidth: 1,
    borderColor: COLORS.safeGreenDark,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: SHAPES.roundedCard,
    shadowColor: COLORS.safeGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  disarmTitle: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.4,
  },
  disarmSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  dispatchNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.sosRedBorder,
    paddingVertical: 12,
    borderRadius: SHAPES.roundedButton,
  },
  dispatchNowText: {
    color: COLORS.sosRed,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
