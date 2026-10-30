import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES, SPACING } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isArmed?: boolean;
  onQuickAlertPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'SAFE ROUTE PLUS',
  isArmed = true,
  onQuickAlertPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.badgePill}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{subtitle}</Text>
        </View>

        <View style={styles.statusGroup}>
          <View style={[styles.guardBadge, isArmed ? styles.guardActive : styles.guardIdle]}>
            <Ionicons
              name={isArmed ? 'shield-checkmark' : 'shield-outline'}
              size={12}
              color={isArmed ? COLORS.safeGreen : COLORS.textMuted}
            />
            <Text style={[styles.guardText, isArmed ? styles.guardActiveText : styles.guardIdleText]}>
              {isArmed ? 'ARMED' : 'STANDBY'}
            </Text>
          </View>

          {onQuickAlertPress && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.quickTriggerBtn}
              onPress={onQuickAlertPress}
            >
              <Ionicons name="warning" size={15} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: SHAPES.roundedPill,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.6,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4.5,
    paddingHorizontal: 9,
    borderRadius: SHAPES.roundedPill,
    borderWidth: 1,
    gap: 4,
  },
  guardActive: {
    backgroundColor: COLORS.safeGreenBg,
    borderColor: COLORS.safeGreenBorder,
  },
  guardIdle: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  guardText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guardActiveText: {
    color: COLORS.safeGreen,
  },
  guardIdleText: {
    color: COLORS.textMuted,
  },
  quickTriggerBtn: {
    backgroundColor: COLORS.sosRed,
    padding: 6,
    borderRadius: SHAPES.roundedPill,
    borderWidth: 1,
    borderColor: COLORS.sosRedDark,
  },
  titleRow: {
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
});
