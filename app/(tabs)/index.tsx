import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Image, SectionList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useHistory } from '@/contexts/HistoryContext';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';

interface GroupedHistory {
  title: string;
  data: any[];
}

export default function HomeScreen() {
  const { history, loading } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Aujourd'hui";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  // Fonction pour formater le temps relatif
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const scannedDate = new Date(dateString);
    const diffInMs = now.getTime() - scannedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "À l'instant";
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return "Hier";
    } else {
      return `Il y a ${diffInDays} jours`;
    }
  };

  // Grouper l'historique par jour
  const groupedHistory = useMemo(() => {
    const filtered = history.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = filtered.reduce((acc: { [key: string]: any[] }, item) => {
      const dateKey = formatDateHeader(item.scannedAt);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      title: key,
      data: grouped[key],
    }));
  }, [history, searchQuery]);

  // Fonction pour obtenir la couleur selon le score
  const getScoreColor = (score: string | number) => {
    const numScore = typeof score === 'string' ? parseInt(score) : score;
    if (numScore >= 80) return '#16a34a'; // vert
    if (numScore >= 50) return '#f97316'; // orange
    return '#dc2626'; // rouge
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.greeting}>Bonjour.</ThemedText>
            <ThemedText style={styles.subGreeting}>Prenez soin de vous.</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => router.push('/history')}
          >
            <Ionicons name="person-circle-outline" size={50} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un ingrédient..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* History List */}
      {groupedHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="scan-outline" size={60} color="#ccc" />
          <ThemedText style={styles.emptyText}>
            {searchQuery ? "Aucun résultat" : "Aucune analyse pour le moment"}
          </ThemedText>
        </View>
      ) : (
        <SectionList
          sections={groupedHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                {title === "Aujourd'hui" ? "DERNIÈRES ANALYSES" : title.toUpperCase()}
              </ThemedText>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productItem}>
              <View style={styles.productImage}>
                {item.image ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.productImageImg}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                )}
              </View>
              <View style={styles.productInfo}>
                <ThemedText style={styles.productName}>{item.name}</ThemedText>
                <ThemedText style={styles.productBrand}>{getTimeAgo(item.scannedAt)}</ThemedText>
              </View>
              {item.grade && (
                <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(item.grade) }]}>
                  <ThemedText style={styles.scoreText}>{item.grade}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    height: 52,
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: '600',
    color: '#000',
    fontStyle: 'italic',
  },
  subGreeting: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    paddingBottom: 0,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  sectionHeader: {
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  productImageImg: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 13,
    color: '#999',
  },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});

