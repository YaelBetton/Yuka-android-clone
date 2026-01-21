  import NutrimentItem from '@/components/NutrimentItem';
import { DATA } from '@/constants/Data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

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
          <ActivityIndicator />
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

    return (
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {product.product_name || 'Produit inconnu'}
            </Text>
            <Text style={styles.productBrand}>
              {product.brands || ''}
            </Text>
            <Text style={[styles.score, {color: product.score >= 50 ? 'green' : 'red'}]}>
              {product.score || 0}/100
            </Text>
          </View>
        </View>
        <Image source={{ uri: product.image_url }} style={styles.image} />
        <View style= {styles.containerNutriment}>
        <Text style={styles.title}>Bon nutriments</Text>
          {GOOD_NUTRIMENTS.map((key: string) => (
  <NutrimentItem
    key={key}
    good={true}
    {...DATA[key]}
    subtitle="Excellente quantité"
    value={product.nutriments[key]}
  />
))}

{BAD_NUTRIMENTS.map((key: string) => (
  <NutrimentItem
    key={key}
    good={false}
    {...DATA[key]}
    subtitle="Mauvaise quantité"
    value={product.nutriments[key]}
  />
))}

        </View>
      </ScrollView>
    );
  }

  const styles = StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    image: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
      borderRadius: 10,
      backgroundColor: '#f0f0f0',
    },
    containerNutriment: {
      flexDirection: 'column',
      gap: 10,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      gap : 20,
      alignItems: 'flex-start',
      padding: 20,
    },
    productInfo: {
      flexDirection: 'column',
      gap: 10,
    },
    productName: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    productBrand: {
      fontSize: 14,
      color: 'grey',
    },
    score: {
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  export default Modal;
