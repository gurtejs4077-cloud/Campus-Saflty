import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES } from '../theme/colors';
import { soundService } from '../services/soundService';

interface SolidButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'sos' | 'safe' | 'primary' | 'secondary' | 'outline' | 'warning' | 'sand';
  size?: 'small' | 'medium' | 'large' | 'giant';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  subtitle?: string;
}

export const SolidButton: React.FC<SolidButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  subtitle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    soundService.triggerHaptic('medium');
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'sos':
        return {
          button: {
            backgroundColor: COLORS.sosRed,
            borderColor: COLORS.sosRedDark,
          },
          text: { color: COLORS.white },
          iconColor: COLORS.white,
        };
      case 'safe':
        return {
          button: {
            backgroundColor: COLORS.safeGreen,
            borderColor: COLORS.safeGreenDark,
          },
          text: { color: COLORS.white },
          iconColor: COLORS.white,
        };
      case 'warning':
        return {
          button: {
            backgroundColor: COLORS.warningAmber,
            borderColor: COLORS.warningAmberDark,
          },
          text: { color: COLORS.textInverse },
          iconColor: COLORS.textInverse,
        };
      case 'secondary':
        return {
          button: {
            backgroundColor: COLORS.surfaceLight,
            borderColor: COLORS.borderLight,
          },
          text: { color: COLORS.textPrimary },
          iconColor: COLORS.textSecondary,
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: COLORS.primaryBorder,
          },
          text: { color: COLORS.primaryLight },
          iconColor: COLORS.primaryLight,
        };
      case 'sand':
      case 'primary':
      default:
        return {
          button: {
            backgroundColor: COLORS.primary,
            borderColor: COLORS.primaryDark,
          },
          text: { color: COLORS.textInverse },
          iconColor: COLORS.textInverse,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: SHAPES.roundedBlock,
          fontSize: 12,
          iconSize: 15,
        };
      case 'giant':
        return {
          paddingVertical: 18,
          paddingHorizontal: 28,
          borderRadius: SHAPES.roundedCard,
          fontSize: 18,
          iconSize: 24,
        };
      case 'large':
        return {
          paddingVertical: 15,
          paddingHorizontal: 22,
          borderRadius: SHAPES.roundedButton,
          fontSize: 16,
          iconSize: 20,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: SHAPES.roundedButton,
          fontSize: 14,
          iconSize: 18,
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        vStyles.button,
        {
          paddingVertical: sStyles.paddingVertical,
          paddingHorizontal: sStyles.paddingHorizontal,
          borderRadius: sStyles.borderRadius,
        },
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vStyles.text.color} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sStyles.iconSize}
              color={vStyles.iconColor}
              style={{ marginRight: 8 }}
            />
          )}

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.titleText,
                { fontSize: sStyles.fontSize, color: vStyles.text.color },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitleText, { color: vStyles.text.color, opacity: 0.85 }]}>
                {subtitle}
              </Text>
            )}
          </View>

          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sStyles.iconSize}
              color={vStyles.iconColor}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.45,
  },
});
