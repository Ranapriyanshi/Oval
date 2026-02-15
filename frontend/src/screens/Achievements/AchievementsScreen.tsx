import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { achievementsApi, MyAchievementItem } from '../../services/achievements';

const AchievementsScreen = () => {
  const { colors } = useTheme();
  const [list, setList] = useState<MyAchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await achievementsApi.my();
      setList(res.achievements || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCheck = async () => {
    try {
      await achievementsApi.check();
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item, index }: { item: MyAchievementItem; index: number }) => {
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    const target = item.criteria_value ?? 0;
    const pct = target > 0 ? Math.min(100, Math.round((item.progress / target) * 100)) : 0;

    return (
      <View style={[styles.card, { backgroundColor: bg, borderColor: border }]}>
        <View style={styles.row}>
          <Text style={styles.icon}>{item.icon || '🏅'}</Text>
          <View style={styles.body}>
            <Text style={[styles.name, { color: t1 }]}>{item.name}</Text>
            <Text style={[styles.desc, { color: t2 }]}>{item.description}</Text>
            {target > 0 && (
              <View style={[styles.progressBar, { backgroundColor: isAlt ? 'rgba(255,255,255,0.3)' : colors.chipBackground }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${pct}%` }]} />
              </View>
            )}
            <Text style={[styles.progressText, { color: t2 }]}>
              {item.unlocked ? 'Unlocked' : `${item.progress} / ${target}`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <TouchableOpacity style={[styles.checkBtn, { backgroundColor: colors.primary }]} onPress={handleCheck}>
        <Text style={styles.checkBtnText}>Check progress</Text>
      </TouchableOpacity>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textTertiary }]}>No achievements yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  checkBtn: { margin: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.sm, alignItems: 'center' },
  checkBtnText: { color: '#FFF', fontWeight: fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  card: { padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.md },
  row: { flexDirection: 'row' },
  icon: { fontSize: 36, marginRight: spacing.md },
  body: { flex: 1 },
  name: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  desc: { fontSize: fontSize.sm, marginTop: spacing.xs },
  progressBar: { height: 6, borderRadius: 3, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: fontSize.xs, marginTop: spacing.xs },
  empty: { textAlign: 'center', padding: spacing.xl },
});

export default AchievementsScreen;
