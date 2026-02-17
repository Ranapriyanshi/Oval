import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { adminApi, AdminStats } from '../../services/admin';

export default function AdminScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await adminApi.stats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !stats) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const items = stats ? [
    { label: 'Users', value: stats.users },
    { label: 'Venues', value: stats.venues },
    { label: 'Events', value: stats.events },
    { label: 'Bookings', value: stats.bookings },
    { label: 'Gametimes', value: stats.gametimes },
  ] : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Analytics</Text>
        {items.map((item, index) => (
          <View key={item.label} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{item.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.xl, textTransform: 'capitalize' },
  card: { padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSize.base },
  value: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
});
