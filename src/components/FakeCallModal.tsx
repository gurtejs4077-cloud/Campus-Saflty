import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES } from '../theme/colors';
import { soundService } from '../services/soundService';

interface FakeCallModalProps {
  visible: boolean;
  onClose: () => void;
  callerName?: string;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  visible,
  onClose,
  callerName = 'Mom (Sarah Sterling)',
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (visible) {
      setCallState('ringing');
      setCallDuration(0);
      soundService.triggerHaptic('medium');
    } else {
      setCallState('ringing');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  useEffect(() => {
    let timer: any = null;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  if (!visible) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        {/* Top Caller Info */}
        <View style={styles.callerInfoBox}>
          <View style={styles.avatarShape}>
            <Ionicons name="person" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.callerNameText}>{callerName}</Text>
          <Text style={styles.callerSubText}>
            {callState === 'ringing' ? 'Incoming Call...' : formatDuration(callDuration)}
          </Text>
        </View>

        {callState === 'connected' ? (
          <View style={styles.inCallArea}>
            <View style={styles.scriptHintBox}>
              <Ionicons name="bulb-outline" size={17} color={COLORS.primary} />
              <Text style={styles.scriptHintText}>
                Safety Tip: Speak naturally. "Hey Mom, yeah I'm just walking down the street, see you in 2 minutes!"
              </Text>
            </View>

            <View style={styles.callControlsGrid}>
              <View style={styles.callControlCircle}>
                <Ionicons name="mic-off-outline" size={24} color={COLORS.textPrimary} />
              </View>
              <View style={styles.callControlCircle}>
                <Ionicons name="keypad-outline" size={24} color={COLORS.textPrimary} />
              </View>
              <View style={styles.callControlCircle}>
                <Ionicons name="volume-high-outline" size={24} color={COLORS.textPrimary} />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.hangupButton}
              onPress={onClose}
            >
              <Ionicons name="call" size={28} color={COLORS.white} style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.incomingControls}>
            <View style={styles.buttonCol}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.callBtn, styles.declineBtn]}
                onPress={onClose}
              >
                <Ionicons name="close" size={30} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.btnLabel}>Decline</Text>
            </View>

            <View style={styles.buttonCol}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.callBtn, styles.acceptBtn]}
                onPress={() => {
                  soundService.triggerHaptic('success');
                  setCallState('connected');
                }}
              >
                <Ionicons name="call" size={28} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.btnLabel}>Accept</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121110',
    paddingVertical: 70,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callerInfoBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarShape: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  callerNameText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  callerSubText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  inCallArea: {
    width: '100%',
    alignItems: 'center',
    gap: 32,
  },
  scriptHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 16,
    borderRadius: SHAPES.roundedCard,
    gap: 12,
  },
  scriptHintText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  callControlsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  callControlCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangupButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.sosRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.sosRedDark,
  },
  incomingControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonCol: {
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    backgroundColor: COLORS.sosRed,
    borderWidth: 2,
    borderColor: COLORS.sosRedDark,
  },
  acceptBtn: {
    backgroundColor: COLORS.safeGreen,
    borderWidth: 2,
    borderColor: COLORS.safeGreenDark,
  },
  btnLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
