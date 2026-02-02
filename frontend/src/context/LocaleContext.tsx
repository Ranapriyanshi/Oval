import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

interface LocaleContextType {
  country: string;
  currency: string;
  timezone: string;
  distanceUnit: 'km' | 'miles';
  setCountry: (country: string) => void;
  formatCurrency: (amount: number) => string;
  formatDistance: (distance: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const COUNTRY_CONFIG = {
  AU: {
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    distanceUnit: 'km' as const,
  },
  US: {
    currency: 'USD',
    timezone: 'America/New_York',
    distanceUnit: 'miles' as const,
  },
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [country, setCountryState] = useState<string>('AU');
  const [currency, setCurrency] = useState<string>('AUD');
  const [timezone, setTimezone] = useState<string>('Australia/Sydney');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');

  useEffect(() => {
    loadLocaleSettings();
  }, []);

  const loadLocaleSettings = async () => {
    try {
      const savedCountry = await AsyncStorage.getItem('userCountry');
      const deviceLocale = Localization.locale || 'en-AU';
      const detectedCountry = savedCountry || (deviceLocale.includes('AU') ? 'AU' : 'US');
      
      setCountry(detectedCountry);
      const config = COUNTRY_CONFIG[detectedCountry as keyof typeof COUNTRY_CONFIG] || COUNTRY_CONFIG.AU;
      
      setCurrency(config.currency);
      setTimezone(config.timezone);
      setDistanceUnit(config.distanceUnit);
      
      // Update i18n language
      i18n.changeLanguage(detectedCountry === 'AU' ? 'en-AU' : 'en-US');
    } catch (error) {
      console.error('Error loading locale settings:', error);
    }
  };

  const setCountry = async (newCountry: string) => {
    try {
      await AsyncStorage.setItem('userCountry', newCountry);
      setCountryState(newCountry);
      
      const config = COUNTRY_CONFIG[newCountry as keyof typeof COUNTRY_CONFIG] || COUNTRY_CONFIG.AU;
      setCurrency(config.currency);
      setTimezone(config.timezone);
      setDistanceUnit(config.distanceUnit);
      
      // Update i18n language
      i18n.changeLanguage(newCountry === 'AU' ? 'en-AU' : 'en-US');
    } catch (error) {
      console.error('Error saving country:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(i18n.language === 'en-AU' ? 'en-AU' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDistance = (distance: number): string => {
    if (distanceUnit === 'km') {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${(distance * 0.621371).toFixed(1)} miles`;
    }
  };

  return (
    <LocaleContext.Provider
      value={{
        country,
        currency,
        timezone,
        distanceUnit,
        setCountry,
        formatCurrency,
        formatDistance,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};
