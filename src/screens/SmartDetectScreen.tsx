import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES, SPACING } from '../theme/colors';
import { Header } from '../components/Header';
import { DetectionSettings, SensorTelemetry, SensitivityLevel } from '../types';
import { sensorService } from '../services/sensorService';
import { soundService } from '../services/soundService';

interface SmartDetectScreenProps {
  settings: DetectionSettings;
  onUpdateSettings: (settings: DetectionSettings) => void;
  onSimulateFall: () => void;
  onSimulateScream: () => void;
}

export const SmartDetectScreen: React.FC<SmartDetectScreenProps> = ({
  settings,
  onUpdateSettings,
  onSimulateFall,
  onSimulateScream,
}) => {
  const [telemetry, setTelemetry] = useState<SensorTelemetry>({
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    currentG: 1.0,
    peakG: 1.0,
    audioDb: 36,
    peakDb: 42,
    isFallCandidate: false,
    isScreamCandidate: false,
    isBackgroundActive: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Periodic update placeholder
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFall = () => {
    soundService.triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      fallDetectionEnabled: !settings.fallDetectionEnabled,
    });
  };

  const toggleScream = () => {
    soundService.triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      screamDetectionEnabled: !settings.screamDetectionEnabled,
    });
  };

  const toggleSilence = () => {
    soundService.triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      silenceAfterFallEnabled: !settings.silenceAfterFallEnabled,
    });
  };

  const toggleBackground = () => {
    soundService.triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      backgroundMonitoringEnabled: !settings.backgroundMonitoringEnabled,
    });
  };

  const setCountdown = (seconds: number) => {
    soundService.triggerHaptic('medium');
    onUpdateSettings({
      ...settings,
      countdownSeconds: seconds,
    });
  };

  const setFallSensitivity = (lvl: SensitivityLevel) => {
    soundService.triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      fallSensitivity: lvl,
    });
  };

  const setScreamSensitivity = (lvl: SensitivityLevel) => {
    soundService.triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      screamSensitivity: lvl,
    });
  };

  const handleTestBackTap = () => {
    soundService.triggerHaptic('heavy');
    sensorService.simulateHardwareBackTap();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Smart Guardian"
        subtitle="SENSOR TELEMETRY & AUTO-DETECT"
        isArmed={settings.fallDetectionEnabled || settings.screamDetectionEnabled}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Safety Anomaly Banner */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.infoText}>
            Our AI sensor engine monitors abrupt drops, impact shocks, and distress cries. When triggered, a false-alarm countdown starts so you can cancel accidental alerts at any time.
          </Text>
        </View>

        {/* Live Telemetry Solid Meters */}
        <View style={styles.metersRow}>
          {/* Accelerometer Card */}
          <View style={styles.meterCard}>
            <View style={styles.meterHeader}>
              <Ionicons name="speedometer-outline" size={15} color={COLORS.primary} />
              <Text style={styles.meterTitle}>G-FORCE METER</Text>
            </View>
            <Text style={styles.meterValue}>{telemetry.currentG} G</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(100, (telemetry.currentG / 4.0) * 100)}%`,
                    backgroundColor: telemetry.currentG > 2.5 ? COLORS.sosRed : COLORS.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.meterSub}>
              Threshold: {settings.fallSensitivity === 'high' ? '2.2G' : settings.fallSensitivity === 'low' ? '3.5G' : '2.7G'}
            </Text>
          </View>

          {/* Microphone Decibel Card */}
          <View style={styles.meterCard}>
            <View style={styles.meterHeader}>
              <Ionicons name="mic-outline" size={15} color={COLORS.warningAmber} />
              <Text style={styles.meterTitle}>SOUND DECIBELS</Text>
            </View>
            <Text style={styles.meterValue}>{telemetry.audioDb} dB</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(100, (telemetry.audioDb / 110) * 100)}%`,
                    backgroundColor: telemetry.audioDb > 80 ? COLORS.sosRed : COLORS.warningAmber,
                  },
                ]}
              />
            </View>
            <Text style={styles.meterSub}>
              Trigger: &gt; {settings.screamSensitivity === 'high' ? '72 dB' : settings.screamSensitivity === 'low' ? '88 dB' : '80 dB'}
            </Text>
          </View>
        </View>

        {/* iOS Lock Screen & Background Protection Card */}
        <View style={styles.bgProtectionCard}>
          <View style={styles.bgProtectionHeader}>
            <View style={styles.bgIconBadge}>
              <Ionicons name="phone-portrait-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bgProtectionTitle}>iOS Background & Lock Screen Mode</Text>
              <Text style={styles.bgProtectionSub}>
                Keeps sensors vigilant & supports instant hardware lock-screen triggers
              </Text>
            </View>
            <Switch
              value={!!settings.backgroundMonitoringEnabled}
              onValueChange={toggleBackground}
              trackColor={{ false: COLORS.surfaceActive, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.bgFeaturesList}>
            <View style={styles.bgFeatureItem}>
              <Ionicons name="mic-circle-outline" size={16} color={COLORS.safeGreen} />
              <Text style={styles.bgFeatureText}>
                <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>Background Audio Session: </Text>
                iOS keeps app alive to monitor screams even while screen is off.
              </Text>
            </View>

            <View style={styles.bgFeatureItem}>
              <Ionicons name="finger-print-outline" size={16} color={COLORS.primary} />
              <Text style={styles.bgFeatureText}>
                <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>iOS Back Tap / Shortcuts: </Text>
                Double-tap phone back to trigger deep link <Text style={{ color: COLORS.primaryLight, fontFamily: 'monospace' }}>girls-safety://sos</Text>.
              </Text>
            </View>
          </View>
        </View>

        {/* Test Simulation Controls */}
        <View style={styles.testSectionCard}>
          <View style={styles.testSectionHeader}>
            <Ionicons name="flask-outline" size={17} color={COLORS.primary} />
            <Text style={styles.testSectionTitle}>TEST COUNTDOWN SIMULATION</Text>
          </View>
          <Text style={styles.testSectionSub}>
            Safely verify how the app responds when an emergency is detected. You will have {settings.countdownSeconds}s to tap "I'm Safe".
          </Text>

          <View style={styles.testButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.testButton, { borderColor: COLORS.sosRedBorder }]}
              onPress={onSimulateFall}
            >
              <Ionicons name="body" size={15} color={COLORS.sosRed} />
              <Text style={styles.testButtonText}>Test Fall</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.testButton, { borderColor: COLORS.warningAmberBorder }]}
              onPress={onSimulateScream}
            >
              <Ionicons name="volume-high" size={15} color={COLORS.warningAmber} />
              <Text style={styles.testButtonText}>Test Scream</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.testButton, { borderColor: COLORS.primaryBorder }]}
              onPress={handleTestBackTap}
            >
              <Ionicons name="hand-left-outline" size={15} color={COLORS.primary} />
              <Text style={styles.testButtonText}>Test Back Tap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fall Detection Configuration */}
        <View style={styles.configCard}>
          <View style={styles.configHeaderRow}>
            <View style={[styles.configIconBox, { backgroundColor: COLORS.primaryBg }]}>
              <Ionicons name="body-outline" size={19} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.configTitle}>Sudden Fall Detection</Text>
              <Text style={styles.configSub}>Recognizes abrupt drops & high-impact shocks</Text>
            </View>
            <Switch
              value={settings.fallDetectionEnabled}
              onValueChange={toggleFall}
              trackColor={{ false: COLORS.surfaceActive, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          {settings.fallDetectionEnabled && (
            <View style={styles.subConfigArea}>
              <Text style={styles.subConfigLabel}>DETECTION SENSITIVITY</Text>
              <View style={styles.segmentedSelector}>
                {(['low', 'medium', 'high'] as SensitivityLevel[]).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.segmentBtn,
                      settings.fallSensitivity === lvl && styles.segmentBtnActive,
                    ]}
                    onPress={() => setFallSensitivity(lvl)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        settings.fallSensitivity === lvl && styles.segmentTextActive,
                      ]}
                    >
                      {lvl.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Silence after fall check */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkOptionRow}
                onPress={toggleSilence}
              >
                <Ionicons
                  name={settings.silenceAfterFallEnabled ? 'checkbox' : 'square-outline'}
                  size={19}
                  color={settings.silenceAfterFallEnabled ? COLORS.primary : COLORS.textMuted}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.checkTitle}>Post-Fall Immobility Check</Text>
                  <Text style={styles.checkSub}>
                    Triggers immediately if phone detects fall followed by stillness
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Scream / Audio Detection Configuration */}
        <View style={styles.configCard}>
          <View style={styles.configHeaderRow}>
            <View style={[styles.configIconBox, { backgroundColor: COLORS.warningAmberBg }]}>
              <Ionicons name="mic-outline" size={19} color={COLORS.warningAmber} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.configTitle}>Loud Scream Detection</Text>
              <Text style={styles.configSub}>Monitors microphone for sharp distress cries</Text>
            </View>
            <Switch
              value={settings.screamDetectionEnabled}
              onValueChange={toggleScream}
              trackColor={{ false: COLORS.surfaceActive, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          {settings.screamDetectionEnabled && (
            <View style={styles.subConfigArea}>
              <Text style={styles.subConfigLabel}>ACOUSTIC SENSITIVITY</Text>
              <View style={styles.segmentedSelector}>
                {(['low', 'medium', 'high'] as SensitivityLevel[]).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.segmentBtn,
                      settings.screamSensitivity === lvl && styles.segmentBtnActive,
                    ]}
                    onPress={() => setScreamSensitivity(lvl)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        settings.screamSensitivity === lvl && styles.segmentTextActive,
                      ]}
                    >
                      {lvl.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Verification Timer Duration */}
        <View style={styles.configCard}>
          <View style={styles.configHeaderRow}>
            <View style={[styles.configIconBox, { backgroundColor: COLORS.primaryBg }]}>
              <Ionicons name="timer-outline" size={19} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.configTitle}>False-Alarm Verification Timer</Text>
              <Text style={styles.configSub}>Time window to cancel before alerts dispatch</Text>
            </View>
          </View>

          <View style={styles.timerSelectorRow}>
            {[5, 10, 15, 20].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.timerPillBtn,
                  settings.countdownSeconds === sec && styles.timerPillBtnActive,
                ]}
                onPress={() => setCountdown(sec)}
              >
                <Text
                  style={[
                    styles.timerPillText,
                    settings.countdownSeconds === sec && styles.timerPillTextActive,
                  ]}
                >
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 14,
    gap: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  metersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meterCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 14,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  meterTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  meterValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  barTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceActive,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  meterSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  bgProtectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    padding: 16,
    gap: 12,
  },
  bgProtectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bgIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgProtectionTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  bgProtectionSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  bgFeaturesList: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bgFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bgFeatureText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  testSectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    gap: 10,
  },
  testSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  testSectionSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: SHAPES.roundedBlock,
    gap: 5,
  },
  testButtonText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  configCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
  },
  configHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  configIconBox: {
    width: 38,
    height: 38,
    borderRadius: SHAPES.roundedBlock,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  configSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  subConfigArea: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  subConfigLabel: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  segmentedSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SHAPES.roundedBlock,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    color: COLORS.textMuted,
    fontWeight: '800',
    fontSize: 11,
  },
  segmentTextActive: {
    color: COLORS.textInverse,
  },
  checkOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 12,
    borderRadius: SHAPES.roundedBlock,
    marginTop: 4,
  },
  checkTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  checkSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  timerSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  timerPillBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 10,
    borderRadius: SHAPES.roundedBlock,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  timerPillBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  timerPillText: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    fontSize: 13,
  },
  timerPillTextActive: {
    color: COLORS.textInverse,
  },
});
