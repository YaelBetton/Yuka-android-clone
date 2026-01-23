  import NutrimentItem from '@/components/NutrimentItem';
import { DATA } from '@/constants/Data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const options = {
  title: 'Détails du produit',
};


  type Product = {
    code: string;
    product_name?: string;
    product_name_fr?: string;
    generic_name_fr?: string;
    image_url?: string;
    [key: string]: any;
  };

  const Modal = () => {
    const { code } = useLocalSearchParams() as { code?: string };
    const [product, setProduct] = useState<Product | null>(null);
    const router = useRouter();

    useEffect(() => {
      const loadProduct = async () => {
        if (!code) return;

        try {
          const products = await AsyncStorage.getItem("products");
          const savedProducts = products ? JSON.parse(products) : [];
          const foundProduct = savedProducts.find((p: Product) => p.code === code);
          setProduct(foundProduct ?? null);
        } catch (error) {
          console.error("Erreur de récupération produit :", error);
        }
      };

      loadProduct();
    }, [code]);

    if (!product) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      );
    }

    console.log("Produit infos => ", product.nutriments);
    
    const BAD_NUTRIMENTS = Object.keys(product.nutriments).filter((key:string) => {
      if (Object.keys(DATA).includes(key)) {
        return product.nutriments[key] > DATA[key].limit;
      }
      return false;
    });

    const GOOD_NUTRIMENTS = Object.keys(product.nutriments).filter((key:string) => {
      if (Object.keys(DATA).includes(key)) {
        return product.nutriments[key] < DATA[key].limit;
      }
      return false;
    });

    const getScoreColor = (score: number) => {
      if (score >= 70) return '#16a34a'; // vert
      if (score >= 40) return '#f97316'; // orange
      return '#dc2626'; // rouge
    };

    return (
      <View style={styles.container}>
        {/* Header avec bouton retour */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Détails du produit</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Image et info principale */}
          <View style={styles.mainInfo}>
            <Image source={{ uri: product.image_url }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>
                {product.product_name || 'Produit inconnu'}
              </Text>
              {product.brands && (
                <Text style={styles.productBrand}>{product.brands}</Text>
              )}
            </View>
          </View>

          {/* Score */}
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(product.score || 0) }]}>
              <Text style={styles.scoreValue}>{product.score || 0}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>Score nutritionnel</Text>
              <Text style={styles.scoreDescription}>
                {product.score >= 70 ? 'Excellente qualité nutritionnelle' : 
                 product.score >= 40 ? 'Qualité nutritionnelle moyenne' : 
                 'Qualité nutritionnelle faible'}
              </Text>
            </View>
          </View>

          {/* Bons nutriments */}
          {GOOD_NUTRIMENTS.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                <Text style={styles.sectionTitle}>Points positifs</Text>
              </View>
              {GOOD_NUTRIMENTS.map((key: string) => (
                <NutrimentItem
                  key={key}
                  good={true}
                  {...DATA[key]}
                  subtitle="Excellente quantité"
                  value={product.nutriments[key]}
                />
              ))}
            </View>
          )}

          {/* Mauvais nutriments */}
          {BAD_NUTRIMENTS.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={24} color="#dc2626" />
                <Text style={styles.sectionTitle}>Points à surveiller</Text>
              </View>
              {BAD_NUTRIMENTS.map((key: string) => (
                <NutrimentItem
                  key={key}
                  good={false}
                  {...DATA[key]}
                  subtitle="Quantité élevée"
                  value={product.nutriments[key]}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingBottom: 15,
      paddingHorizontal: 20,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    backButton: {
      padding: 5,
    },
    topBarTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000',
    },
    placeholder: {
      width: 34,
    },
    scrollView: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    mainInfo: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
    },
    productImage: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    productDetails: {
      alignItems: 'center',
    },
    productName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
      marginBottom: 8,
    },
    productBrand: {
      fontSize: 16,
      color: '#999',
      textAlign: 'center',
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 12,
    },
    scoreCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
    },
    scoreValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
    },
    scoreLabel: {
      fontSize: 14,
      color: '#fff',
      opacity: 0.9,
    },
    scoreInfo: {
      flex: 1,
    },
    scoreTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
      marginBottom: 4,
    },
    scoreDescription: {
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
    },
    section: {
      marginBottom: 25,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
      marginLeft: 10,
    },
  });

  export default Modal;
