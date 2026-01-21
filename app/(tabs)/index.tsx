import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedView style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={60} color="#dc2626" />
          <ThemedText style={styles.title}>Yuka</ThemedText>
          <ThemedText style={styles.subtitle}>
            Scanner vos produits
          </ThemedText>
        </View>

        {/* Main Action Button */}
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/scanner')}
        >
          <Ionicons name="barcode-outline" size={32} color="#fff" />
          <ThemedText style={styles.scanButtonText}>
            Scanner un produit
          </ThemedText>
        </TouchableOpacity>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="search-outline" size={28} color="#dc2626" />
            </View>
            <ThemedText style={styles.featureTitle}>
              Décryptez
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="fitness-outline" size={28} color="#dc2626" />
            </View>
            <ThemedText style={styles.featureTitle}>
              Évaluez
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="swap-horizontal-outline" size={28} color="#dc2626" />
            </View>
            <ThemedText style={styles.featureTitle}>
              Comparez
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 30,
    padding : 20,
    fontWeight: 'bold',
    color: '#dc2626',
    width: '100%',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    opacity: 0.7,
  },
  scanButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginVertical: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
