import { StyleSheet, ScrollView, View, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useHistory } from '@/contexts/HistoryContext';

export default function HistoryScreen() {
  const { history, clearHistory, loading } = useHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="time-outline" size={40} color="#dc2626" />
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={24} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
        <ThemedText style={styles.title}>Historique</ThemedText>
        <ThemedText style={styles.subtitle}>
          {history.length} produit{history.length > 1 ? 's' : ''} scanné{history.length > 1 ? 's' : ''}
        </ThemedText>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={60} color="#999" />
          <ThemedText style={styles.emptyText}>
            Aucun produit scanné pour le moment
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Commencez par scanner un produit !
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.itemLeft}>
                <Ionicons name="barcode-outline" size={24} color="#dc2626" />
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemBarcode}>{item.barcode}</ThemedText>
                </View>
              </View>
              <View style={styles.itemRight}>
                {item.grade && (
                  <View style={styles.gradebadge}>
                    <ThemedText style={styles.gradeText}>{item.grade}</ThemedText>
                  </View>
                )}
                <ThemedText style={styles.itemDate}>{formatDate(item.scannedAt)}</ThemedText>
              </View>
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 10,
    opacity: 0.6,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemBarcode: {
    fontSize: 12,
    opacity: 0.6,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  gradebadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  gradeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 11,
    opacity: 0.5,
  },
});
