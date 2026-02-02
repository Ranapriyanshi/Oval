import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { country, currency, formatCurrency } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.welcome')}</Text>
      {user && (
        <>
          <Text style={styles.text}>Hello, {user.name}!</Text>
          <Text style={styles.text}>Country: {country}</Text>
          <Text style={styles.text}>Currency: {currency}</Text>
          <Text style={styles.text}>Sample: {formatCurrency(99.99)}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default HomeScreen;
