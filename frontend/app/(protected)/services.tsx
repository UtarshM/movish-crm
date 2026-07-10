import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView, RefreshControl, ScrollView, Switch } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../src/utils/api';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/utils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function MobileServicesScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  // Fetch job cards
  const load = useCallback(async () => {
    try {
      const data = await api.get<any[]>('/workshop');
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Mobile load failed", err);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // Sync checklist edits back to API
  const updateChecklist = async (updated: any) => {
    try {
      const res = await api.put(`/workshop`, updated);
      setCards(prev => prev.map(c => c.id === updated.id ? res : c));
      setSelectedCard(res);
    } catch (err) {
      alert("Failed to update workshop. Try again.");
    }
  };

  const toggleField = (category: string, field: string) => {
    if (!selectedCard) return;
    const updated = {
      ...selectedCard,
      [category]: {
        ...selectedCard[category],
        [field]: !selectedCard[category][field]
      }
    };
    updateChecklist(updated);
  };

  const advanceStageMobile = () => {
    if (!selectedCard || selectedCard.stage >= 10) return;
    const next = selectedCard.stage + 1;
    const updated = {
      ...selectedCard,
      stage: next,
      status: next === 10 ? 'delivered' : next >= 8 ? 'qc' : 'in-progress'
    };
    updateChecklist(updated);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => { selectedCard ? setSelectedCard(null) : router.back() }}>
          <Ionicons name={selectedCard ? "chevron-back" : "arrow-back"} size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>{selectedCard ? `JC Details` : `Workshop DMS`}</Text>
        {!selectedCard && <Text style={styles.count}>{cards.filter(c => c.stage < 10).length} Active</Text>}
      </View>

      {selectedCard ? (
        // DETAIL VIEW FOR SELECTED JOB CARD WITH CHECKLISTS
        <ScrollView style={styles.detailContainer} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
          <View style={styles.infoBox}>
            <View style={styles.infoHead}>
              <View>
                <Text style={styles.infoReg}>{selectedCard.vehicleNumber}</Text>
                <Text style={styles.infoModel}>{selectedCard.vehicleModel}</Text>
              </View>
              <View style={styles.stageBadge}>
                <Text style={styles.stageBadgeText}>Stage {selectedCard.stage}/10</Text>
              </View>
            </View>
            <Text style={styles.infoCustomer}>Client: <Text style={{ color: Colors.text, fontWeight: '700' }}>{selectedCard.customerName}</Text></Text>
            <Text style={styles.infoOdo}>Odometer: {selectedCard.odometerReading.toLocaleString()} km</Text>
            {selectedCard.driverComplaints ? (
              <View style={styles.complaintsBox}>
                <Text style={styles.complaintsLabel}>Complaints:</Text>
                <Text style={styles.complaintsText}>"{selectedCard.driverComplaints}"</Text>
              </View>
            ) : null}
          </View>

          {/* STAGE 4: MECHANICAL OPERATIONS CHECKLIST */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stage 4: Service Operations Checklist</Text>
            <Text style={styles.sectionSubtitle}>Mechanical check-off points inside the bay:</Text>
            
            <CheckItem label="Engine Oil Replacement" value={selectedCard.operationsPerformed?.engineOilReplaced} onToggle={() => toggleField('operationsPerformed', 'engineOilReplaced')} />
            <CheckItem label="Oil Filter Replacement" value={selectedCard.operationsPerformed?.oilFilterReplaced} onToggle={() => toggleField('operationsPerformed', 'oilFilterReplaced')} />
            <CheckItem label="Fuel Filter Servicing" value={selectedCard.operationsPerformed?.fuelFilterServiced} onToggle={() => toggleField('operationsPerformed', 'fuelFilterServiced')} />
            <CheckItem label="Air Filter Cleaning" value={selectedCard.operationsPerformed?.airFilterServiced} onToggle={() => toggleField('operationsPerformed', 'airFilterServiced')} />
            <CheckItem label="Drive Belt Tension Check" value={selectedCard.operationsPerformed?.beltTensionChecked} onToggle={() => toggleField('operationsPerformed', 'beltTensionChecked')} />
            <CheckItem label="Clutch Pedal Play Adjustment" value={selectedCard.operationsPerformed?.clutchAdjusted} onToggle={() => toggleField('operationsPerformed', 'clutchAdjusted')} />
            <CheckItem label="Brake Linings Inspection" value={selectedCard.operationsPerformed?.brakeLiningInspected} onToggle={() => toggleField('operationsPerformed', 'brakeLiningInspected')} />
            <CheckItem label="Leaf Springs Inspection" value={selectedCard.operationsPerformed?.leafSpringInspected} onToggle={() => toggleField('operationsPerformed', 'leafSpringInspected')} />
            <CheckItem label="Radiator Outer Core Wash" value={selectedCard.operationsPerformed?.radiatorCleaned} onToggle={() => toggleField('operationsPerformed', 'radiatorCleaned')} />
            <CheckItem label="Coolant Fluid Top-Up" value={selectedCard.operationsPerformed?.coolantToppedUp} onToggle={() => toggleField('operationsPerformed', 'coolantToppedUp')} />
          </View>

          {/* STAGE 5: WASHING & GREASING CHECKLIST */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stage 5: Washing & Greasing Checklist</Text>
            <Text style={styles.sectionSubtitle}>Pressure wash and lubrication point checks:</Text>
            
            <CheckItem label="Under-body Pressure Wash" value={selectedCard.washingGreasing?.pressureWash} onToggle={() => toggleField('washingGreasing', 'pressureWash')} />
            <CheckItem label="Chassis Greasing" value={selectedCard.washingGreasing?.chassisGreasing} onToggle={() => toggleField('washingGreasing', 'chassisGreasing')} />
            <CheckItem label="Propeller Shaft Universal Joint" value={selectedCard.washingGreasing?.propellerShaftGreasing} onToggle={() => toggleField('washingGreasing', 'propellerShaftGreasing')} />
            <CheckItem label="Kingpin Lubrication" value={selectedCard.washingGreasing?.kingpinLubrication} onToggle={() => toggleField('washingGreasing', 'kingpinLubrication')} />
          </View>

          {/* ACTIONS FOOTER */}
          <View style={styles.actionsBlock}>
            {selectedCard.stage < 10 ? (
              <Pressable style={styles.primaryBtn} onPress={advanceStageMobile}>
                <Text style={styles.primaryBtnText}>Advance to Stage {selectedCard.stage + 1}</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </Pressable>
            ) : (
              <View style={styles.completedBanner}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.completedBannerText}>Vehicle Delivered to Customer</Text>
              </View>
            )}
            <Pressable style={styles.secondaryBtn} onPress={() => setSelectedCard(null)}>
              <Text style={styles.secondaryBtnText}>Back to Active Cards</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        // ACTIVE JOB CARDS LIST
        <FlatList
          data={cards}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="construct-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No Active Job Cards inside bays</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isCompleted = item.stage === 10;
            return (
              <Pressable style={styles.card} onPress={() => setSelectedCard(item)}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardReg}>{item.vehicleNumber}</Text>
                    <Text style={styles.cardModel}>{item.vehicleModel}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: isCompleted ? '#e8f5e9' : Colors.primaryLight }]}>
                    <Text style={[styles.badgeText, { color: isCompleted ? '#2e7d32' : Colors.primary }]}>
                      Stage {item.stage}/10
                    </Text>
                  </View>
                </View>
                <View style={styles.cardDivider} />
                <View style={styles.cardBottom}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>Client</Text>
                    <Text style={styles.cardValue}>{item.customerName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cardLabel}>Repair Category</Text>
                    <Text style={styles.cardValue}>{item.serviceSchedule?.category || 'Service'}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function CheckItem({ label, value, onToggle }: { label: string, value: boolean, onToggle: () => void }) {
  return (
    <View style={styles.checkRow}>
      <Text style={styles.checkText}>{label}</Text>
      <Switch
        value={!!value}
        onValueChange={onToggle}
        trackColor={{ false: '#e2e8f0', true: '#084D8C' }}
        thumbColor={value ? Colors.white : '#94a3b8'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.lg, 
    paddingTop: Spacing.lg, 
    paddingBottom: Spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border, 
    gap: Spacing.md 
  },
  title: { flex: 1, fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text },
  count: { 
    fontSize: FontSize.xs, 
    fontWeight: '700', 
    color: Colors.primary, 
    backgroundColor: Colors.primaryLight, 
    paddingHorizontal: Spacing.md, 
    paddingVertical: 4, 
    borderRadius: BorderRadius.sm 
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, fontWeight: '600' },
  
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.lg },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardReg: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  cardModel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800' },
  cardDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontSize: FontSize.xs, color: Colors.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginTop: 2 },

  detailContainer: { flex: 1, padding: Spacing.lg },
  infoBox: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  infoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  infoReg: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  infoModel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  stageBadge: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.sm },
  stageBadgeText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.white },
  infoCustomer: { fontSize: FontSize.sm, color: Colors.textMuted },
  infoOdo: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  
  complaintsBox: { backgroundColor: '#f8fafc', borderLeftWidth: 3, borderLeftColor: Colors.primary, padding: Spacing.md, borderRadius: BorderRadius.sm, marginTop: Spacing.md },
  complaintsLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textLight, textTransform: 'uppercase' },
  complaintsText: { fontSize: FontSize.sm, color: Colors.text, fontStyle: 'italic', marginTop: 4 },

  section: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  sectionSubtitle: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 2, marginBottom: Spacing.md },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  checkText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, flex: 1 },

  actionsBlock: { gap: Spacing.sm },
  primaryBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, gap: Spacing.sm },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, borderColor: Colors.border, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, alignItems: 'center' },
  secondaryBtnText: { color: Colors.textMuted, fontSize: FontSize.md, fontWeight: '700' },
  completedBanner: { flexDirection: 'row', gap: Spacing.md, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', padding: Spacing.lg, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  completedBannerText: { color: '#065f46', fontSize: FontSize.md, fontWeight: '800' }
});
