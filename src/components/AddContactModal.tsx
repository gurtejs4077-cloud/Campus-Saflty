import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHAPES } from '../theme/colors';
import { EmergencyContact, ContactType } from '../types';
import { SolidButton } from './SolidButton';

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (contact: EmergencyContact) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [relationOrRole, setRelationOrRole] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<ContactType>('family');
  const [department, setDepartment] = useState('');
  const [isPriority, setIsPriority] = useState(true);

  if (!visible) return null;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a contact name.');
      return;
    }
    const cleanDigits = phone.replace(/[^0-9+]/g, '');
    if (cleanDigits.length < 3) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone or emergency number.');
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      relationOrRole:
        relationOrRole.trim() ||
        (type === 'emergency'
          ? 'Emergency Helpline'
          : type === 'family'
          ? 'Family Guardian'
          : 'Trusted Friend'),
      phone: phone.trim(),
      type,
      isPriority,
      departmentOrLocation: department.trim() || undefined,
      avatarColor:
        type === 'emergency'
          ? COLORS.sosRed
          : type === 'family'
          ? COLORS.primary
          : COLORS.escortPurple,
    };

    onAdd(newContact);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setRelationOrRole('');
    setPhone('');
    setType('family');
    setDepartment('');
    setIsPriority(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Add Safety Contact</Text>
              <Text style={styles.subtitle}>Trusted Guardian or Emergency Helpline</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            {/* Contact Type Toggle */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'family' && styles.typeBtnActive]}
                onPress={() => setType('family')}
              >
                <Ionicons
                  name="home"
                  size={14}
                  color={type === 'family' ? COLORS.textInverse : COLORS.textMuted}
                />
                <Text style={[styles.typeText, type === 'family' && styles.typeTextActive]}>
                  Family
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeBtn, type === 'friend' && styles.typeBtnActive]}
                onPress={() => setType('friend')}
              >
                <Ionicons
                  name="people"
                  size={14}
                  color={type === 'friend' ? COLORS.textInverse : COLORS.textMuted}
                />
                <Text style={[styles.typeText, type === 'friend' && styles.typeTextActive]}>
                  Friend
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeBtn, type === 'emergency' && styles.typeBtnActive]}
                onPress={() => setType('emergency')}
              >
                <Ionicons
                  name="shield"
                  size={14}
                  color={type === 'emergency' ? COLORS.textInverse : COLORS.textMuted}
                />
                <Text style={[styles.typeText, type === 'emergency' && styles.typeTextActive]}>
                  Helpline / 112
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME *</Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  type === 'emergency'
                    ? 'e.g. Local Police Station / Helpline'
                    : type === 'family'
                    ? 'e.g. Mom / Dad / Brother'
                    : 'e.g. Sarah (Roommate / Friend)'
                }
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Input Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>REAL PHONE OR HELPLINE NUMBER *</Text>
              <TextInput
                style={styles.textInput}
                placeholder={type === 'emergency' ? 'e.g. 112, 1091, 911' : 'e.g. +1 555-019-2834 or +91 98765 43210'}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Input Role / Relation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>RELATION / ROLE</Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  type === 'emergency'
                    ? 'e.g. Emergency Police & Dispatch'
                    : type === 'family'
                    ? 'e.g. Mother / Primary Contact'
                    : 'e.g. Best Friend / Flatmate'
                }
                placeholderTextColor={COLORS.textMuted}
                value={relationOrRole}
                onChangeText={setRelationOrRole}
              />
            </View>

            {/* Location / Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>LOCATION / RESIDENCE (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Home, Downtown, Nearby Apartment"
                placeholderTextColor={COLORS.textMuted}
                value={department}
                onChangeText={setDepartment}
              />
            </View>

            {/* Priority Toggle */}
            <TouchableOpacity
              style={styles.priorityToggle}
              activeOpacity={0.8}
              onPress={() => setIsPriority(!isPriority)}
            >
              <Ionicons
                name={isPriority ? 'checkbox' : 'square-outline'}
                size={20}
                color={isPriority ? COLORS.primary : COLORS.textMuted}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.priorityTitle}>Include in Instant SOS Alert</Text>
                <Text style={styles.prioritySub}>
                  Receives automated SMS with live GPS upon emergency trigger
                </Text>
              </View>
            </TouchableOpacity>

            {/* Save Button */}
            <SolidButton
              title="Save Real Contact"
              onPress={handleSave}
              variant="primary"
              size="large"
              icon="save-outline"
              disabled={!name.trim() || !phone.trim()}
              style={{ marginTop: 12 }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    gap: 14,
    paddingBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SHAPES.roundedButton,
    padding: 3,
    gap: 6,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: SHAPES.roundedBlock,
    gap: 5,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  typeTextActive: {
    color: COLORS.textInverse,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.6,
  },
  textInput: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.roundedBlock,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  priorityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 12,
    borderRadius: SHAPES.roundedBlock,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: 4,
  },
  priorityTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  prioritySub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
});
