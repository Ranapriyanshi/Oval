import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { country, timezone, setCountry } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      
      {user && (
        <View style={styles.section}>
          <Text style={styles.label}>Name: {user.name}</Text>
          <Text style={styles.label}>Email: {user.email}</Text>
          <Text style={styles.label}>Country: {country}</Text>
          <Text style={styles.label}>Timezone: {timezone}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Country</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCountry('AU')}
        >
          <Text style={styles.buttonText}>Australia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCountry('US')}
        >
          <Text style={styles.buttonText}>United States</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
