import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES, SPACING } from '../theme/colors';
import { Header } from '../components/Header';
import { EmergencyContact, ContactType } from '../types';
import { soundService } from '../services/soundService';

interface ContactsScreenProps {
  contacts: EmergencyContact[];
  onOpenAddContact: () => void;
  onDeleteContact: (id: string) => void;
  onTogglePriority: (id: string) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts,
  onOpenAddContact,
  onDeleteContact,
  onTogglePriority,
}) => {
  const [filter, setFilter] = useState<'all' | ContactType>('all');

  const filteredContacts = contacts.filter((c) => {
    if (filter === 'all') return true;
    return c.type === filter;
  });

  const handleCall = (phone: string) => {
    soundService.triggerHaptic('medium');
    const cleaned = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleaned}`);
  };

  const handleSMS = (contact: EmergencyContact) => {
    soundService.triggerHaptic('light');
    const cleaned = contact.phone.replace(/[^0-9+]/g, '');
    const msg = encodeURIComponent(
      `EMERGENCY ALERT: I need urgent help! This is a distress alert from my Safe Route Plus app. Check my live GPS location.`
    );
    Linking.openURL(`sms:${cleaned}?body=${msg}`);
  };

  const confirmDelete = (contact: EmergencyContact) => {
    soundService.triggerHaptic('heavy');
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contact.name} (${contact.phone}) from your emergency circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onDeleteContact(contact.id),
        },
      ]
    );
  };

  const familyCount = contacts.filter((c) => c.type === 'family').length;
  const friendCount = contacts.filter((c) => c.type === 'friend').length;
  const emergencyCount = contacts.filter((c) => c.type === 'emergency').length;

  return (
    <View style={styles.container}>
      <Header title="Safety Contacts" subtitle="TRUSTED CIRCLE & EMERGENCY DESK" />

      {/* Filter Tabs */}
      <View style={styles.filterStrip}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({contacts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'family' && styles.filterPillActive]}
          onPress={() => setFilter('family')}
        >
          <Ionicons
            name="home"
            size={12}
            color={filter === 'family' ? COLORS.textInverse : COLORS.primaryLight}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.filterText, filter === 'family' && styles.filterTextActive]}>
            Family ({familyCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'friend' && styles.filterPillActive]}
          onPress={() => setFilter('friend')}
        >
          <Ionicons
            name="people"
            size={12}
            color={filter === 'friend' ? COLORS.textInverse : COLORS.escortPurple}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.filterText, filter === 'friend' && styles.filterTextActive]}>
            Friends ({friendCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'emergency' && styles.filterPillActive]}
          onPress={() => setFilter('emergency')}
        >
          <Ionicons
            name="shield"
            size={12}
            color={filter === 'emergency' ? COLORS.textInverse : COLORS.sosRed}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.filterText, filter === 'emergency' && styles.filterTextActive]}>
            112 / Help ({emergencyCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner about Automated Dispatch */}
        <View style={styles.dispatchNoticeBox}>
          <View style={styles.dispatchIconBox}>
            <Ionicons name="notifications" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.dispatchNoticeText}>
            Contacts flagged with <Text style={{ color: COLORS.primaryLight, fontWeight: '800' }}>PRIORITY</Text> will receive automated SMS alerts with your live GPS location if an emergency countdown expires.
          </Text>
        </View>

        {/* Contacts List */}
        <View style={styles.contactsList}>
          {filteredContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.avatarBadge,
                    {
                      backgroundColor:
                        contact.type === 'emergency'
                          ? COLORS.sosRedBg
                          : contact.type === 'family'
                          ? COLORS.primaryBg
                          : COLORS.escortPurpleBg,
                      borderColor:
                        contact.type === 'emergency'
                          ? COLORS.sosRedBorder
                          : contact.type === 'family'
                          ? COLORS.primaryBorder
                          : COLORS.escortPurpleBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarInitial,
                      {
                        color:
                          contact.type === 'emergency'
                            ? COLORS.sosRed
                            : contact.type === 'family'
                            ? COLORS.primaryLight
                            : COLORS.escortPurple,
                      },
                    ]}
                  >
                    {contact.name.charAt(0)}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>

                    {/* Delete Contact Button */}
                    <TouchableOpacity
                      onPress={() => confirmDelete(contact)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.contactRole}>{contact.relationOrRole}</Text>
                  
                  {contact.departmentOrLocation && (
                    <Text style={styles.deptText}>
                      <Ionicons name="location-outline" size={11} color={COLORS.textMuted} /> {contact.departmentOrLocation}
                    </Text>
                  )}
                </View>
              </View>

              {/* Priority Toggle Pill */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.priorityRow,
                  contact.isPriority ? styles.priorityRowActive : styles.priorityRowInactive,
                ]}
                onPress={() => onTogglePriority(contact.id)}
              >
                <Ionicons
                  name={contact.isPriority ? 'checkmark-circle' : 'ellipse-outline'}
                  size={15}
                  color={contact.isPriority ? COLORS.primary : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.priorityToggleLabel,
                    contact.isPriority && styles.priorityToggleLabelActive,
                  ]}
                >
                  {contact.isPriority ? 'Auto-SMS SOS Dispatch: ON' : 'Auto-SMS SOS Dispatch: OFF (Tap to enable)'}
                </Text>
              </TouchableOpacity>

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.actionBtn, styles.callBtn]}
                  onPress={() => handleCall(contact.phone)}
                >
                  <Ionicons name="call" size={14} color={COLORS.textInverse} />
                  <Text style={styles.callBtnText}>Call {contact.phone}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.actionBtn, styles.smsBtn]}
                  onPress={() => handleSMS(contact)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.textPrimary} />
                  <Text style={styles.smsBtnText}>SMS Alert</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add Contact Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addContactButton}
          onPress={onOpenAddContact}
        >
          <Ionicons name="person-add" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.addContactText}>+ ADD REAL CONTACT NUMBER</Text>
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
  filterStrip: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: SHAPES.roundedPill,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  dispatchNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    gap: 12,
  },
  dispatchIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  dispatchNoticeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SHAPES.roundedCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '900',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  contactName: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  contactRole: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  deptText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: SHAPES.roundedBlock,
    gap: 6,
    borderWidth: 1,
  },
  priorityRowActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primaryBorder,
  },
  priorityRowInactive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
  },
  priorityToggleLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  priorityToggleLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: SHAPES.roundedBlock,
    gap: 6,
  },
  callBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  callBtnText: {
    color: COLORS.textInverse,
    fontWeight: '800',
    fontSize: 12,
  },
  smsBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  smsBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    paddingVertical: 14,
    borderRadius: SHAPES.roundedButton,
    marginTop: 4,
  },
  addContactText: {
    color: COLORS.primaryLight,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
});
