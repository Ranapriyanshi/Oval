import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import XPFeedbackOverlay from '../components/Ovalo/XPFeedbackOverlay';
import type { XPAwardResult } from '../services/ovalo';

interface XPContextType {
  showXPFeedback: (result: XPAwardResult) => void;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export const useXP = (): XPContextType => {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error('useXP must be used within XPProvider');
  return ctx;
};

export const XPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xpResult, setXpResult] = useState<XPAwardResult | null>(null);
  const [visible, setVisible] = useState(false);

  const showXPFeedback = useCallback((result: XPAwardResult) => {
    setXpResult(result);
    setVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setXpResult(null);
  }, []);

  return (
    <XPContext.Provider value={{ showXPFeedback }}>
      {children}
      {xpResult && (
        <XPFeedbackOverlay result={xpResult} visible={visible} onDismiss={handleDismiss} />
      )}
    </XPContext.Provider>
  );
};
