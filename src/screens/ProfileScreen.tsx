import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES, SPACING } from '../theme/colors';
import { Header } from '../components/Header';
import { StudentProfile, IncidentRecord } from '../types';
import { INITIAL_STUDENT_PROFILE, INITIAL_INCIDENTS } from '../services/storageService';

export const ProfileScreen: React.FC = () => {
  const [profile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [incidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);

  return (
    <View style={styles.container}>
      <Header title="Safety Profile" subtitle="EMERGENCY ID & ACTIVITY LOG" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Safety ID Solid Card */}
        <View style={styles.idCard}>
          <View style={styles.idCardHeader}>
            <View style={styles.idBadgePill}>
              <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
              <Text style={styles.idBadgeText}>PERSONAL MEDICAL & SAFETY PASS</Text>
            </View>
            <View style={styles.bloodTypePill}>
              <Text style={styles.bloodTypeText}>{profile.bloodGroup}</Text>
            </View>
          </View>

          <View style={styles.idMainRow}>
            <View style={styles.avatarShape}>
              <Ionicons name="person" size={36} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.studentName}>{profile.name}</Text>
              <Text style={styles.studentId}>SAFE-ID: #8849-2026</Text>
              <Text style={styles.uniName}>Active Guardian Network</Text>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>PRIMARY RESIDENCE</Text>
              <Text style={styles.detailVal}>{profile.dormRoom}</Text>
            </View>
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>REGISTERED PHONE</Text>
              <Text style={styles.detailVal}>{profile.phone}</Text>
            </View>
          </View>

          {/* Medical / Emergency Note */}
          <View style={styles.medicalNoteBox}>
            <Ionicons name="medical" size={14} color={COLORS.sosRed} />
            <Text style={styles.medicalNoteText}>
              Emergency Medical Note: {profile.emergencyNotes}
            </Text>
          </View>
        </View>

        {/* Safety Incident & Trigger Log */}
        <View style={styles.sectionArea}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>INCIDENT & VERIFICATION LOG</Text>
            <Text style={styles.sectionCount}>{incidents.length} Records</Text>
          </View>

          <View style={styles.incidentList}>
            {incidents.map((inc) => (
              <View key={inc.id} style={styles.incidentCard}>
                <View style={styles.incidentTopRow}>
                  <View style={styles.incidentIconBox}>
                    <Ionicons
                      name={
                        inc.status.includes('Cancelled')
                          ? 'shield-checkmark'
                          : 'checkmark-circle'
                      }
                      size={16}
                      color={
                        inc.status.includes('Cancelled')
                          ? COLORS.safeGreen
                          : COLORS.primary
                      }
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.incidentCause}>{inc.causeLabel}</Text>
                    <Text style={styles.incidentTime}>
                      {inc.date} • {inc.time}
                    </Text>
                  </View>
                </View>

                <View style={styles.incidentBottomRow}>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{inc.status}</Text>
                  </View>
                  <Text style={styles.locationText}>
                    <Ionicons name="location-outline" size={12} color={COLORS.textMuted} /> {inc.location}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Protocol Guide Card */}
        <View style={styles.protocolCard}>
          <Text style={styles.protocolHeading}>HOW SMART DISTRESS WORKS</Text>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Sensor or Hardware Trigger</Text>
              <Text style={styles.stepDesc}>
                Sudden fall, loud distress cry, back-tap, or manual SOS button activates countdown.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.warningAmberDark }]}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Verification Countdown Window</Text>
              <Text style={styles.stepDesc}>
                Phone alerts for 10 seconds. You can easily tap "I'm Safe" to cancel accidental false triggers.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.sosRed }]}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Instant Automated Dispatch</Text>
              <Text style={styles.stepDesc}>
                If not cancelled, live GPS coordinates and distress SMS are dispatched to your priority guardians.
              </Text>
            </View>
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
  idCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 18,
    gap: 14,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: SHAPES.roundedPill,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 6,
  },
  idBadgeText: {
    color: COLORS.primaryLight,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  bloodTypePill: {
    backgroundColor: COLORS.sosRedBg,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: SHAPES.roundedPill,
    borderWidth: 1,
    borderColor: COLORS.sosRedBorder,
  },
  bloodTypeText: {
    color: COLORS.sosRed,
    fontWeight: '900',
    fontSize: 11,
  },
  idMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShape: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 18,
  },
  studentId: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  uniName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailBlock: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  detailVal: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  medicalNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sosRedBg,
    padding: 10,
    borderRadius: SHAPES.roundedBlock,
    borderWidth: 1,
    borderColor: COLORS.sosRedBorder,
    gap: 8,
  },
  medicalNoteText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  sectionArea: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.9,
  },
  sectionCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  incidentList: {
    gap: 10,
  },
  incidentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 14,
    gap: 10,
  },
  incidentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incidentIconBox: {
    width: 32,
    height: 32,
    borderRadius: SHAPES.roundedBlock,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentCause: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  incidentTime: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  incidentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusPill: {
    backgroundColor: COLORS.safeGreenBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: SHAPES.roundedPill,
    borderWidth: 1,
    borderColor: COLORS.safeGreenBorder,
  },
  statusPillText: {
    color: COLORS.safeGreen,
    fontWeight: '800',
    fontSize: 10,
  },
  locationText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  protocolCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    gap: 14,
  },
  protocolHeading: {
    color: COLORS.primaryLight,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.9,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: COLORS.textInverse,
    fontWeight: '900',
    fontSize: 12,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  stepDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
});
