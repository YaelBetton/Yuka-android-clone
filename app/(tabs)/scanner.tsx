import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

const API_URL = "https://world.openfoodfacts.org/api/v2/product/"

const MOCKED_BARCODE = 
{"bounds": {"origin": {"x": 381.4545593261719, "y": 265.4545593261719}, "size": {"height": 106.54545593261719, "width": 6.181818008422852}}, 
"cornerPoints": [{"x": 265.4545593261719, "y": 381.4545593261719}, {"x": 265.81817626953125, "y": 385.4545593261719}, {"x": 372, "y": 387.6363525390625}, {"x": 372, "y": 383.6363525390625}], 
"data": "3046920022606", "target": 198, "type": "ean13"};

export default function TabTwoScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission]);


  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const saveItemToStorage = async (product : any) => {
    try {
          const products = await AsyncStorage.getItem("products");
          const savedProducts = products ? JSON.parse(products) : [];

          const index = savedProducts.findIndex((p: any) => p.code === product.code);

          if (index !== -1) {
            savedProducts[index] = product;
          } else {
            savedProducts.unshift(product);
          }
          await AsyncStorage.setItem("products", JSON.stringify(savedProducts));
    }
    catch (error) {
      console.error("Error saving item to storage:", error);
    }

  }

  const safe = (n?: number) => n ?? 0;
  const getScore = (product: any) => {
    const score = Math.round(
      (safe(product.nutriments.energy_100g) +
      safe(product.nutriments.fat_100g) +
      safe(product.nutriments.carbohydrates_100g) +
      safe(product.nutriments.sugars_100g) +
      safe(product.nutriments.fiber_100g) +
      safe(product.nutriments.proteins_100g) +
      safe(product.nutriments.salt_100g)) / 100
    );
    return Math.min(Math.max(score, 0), 100);
  };


  const handleScan = async (scanningResult: BarcodeScanningResult) => {
  console.log("Scanned", scanningResult);
  setScanned(true);

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  timeoutRef.current = setTimeout(() => {
    (async () => {
      try {
        const response = await axios.get(API_URL + scanningResult.data + ".json?lc=fr");
        console.log("response", response.data);

        if (response.data.status === 1) {
          const product = response.data.product;
          const score = getScore(product);

          await saveItemToStorage({ ...product, score });

          if (product?.code) {
            router.push({
              pathname: "/modal",
              params: { code: product.code },
            });
          }
        }
      } catch (error) {
        console.error("Erreur API :", error);
      } finally {
        setScanned(false);
      }
    })();
  }, 1000);
}


  return (
    <View style={{ flex: 1 }}>
      {scanned && <View style={styles.feedback}>
        <ActivityIndicator color={"white"} /> </View>}
      <CameraView style={StyleSheet.absoluteFill} 
        barcodeScannerSettings={
          {
            barcodeTypes: ['ean13', 'ean8'],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      
      <View style={styles.overlay}>
        <Button onPress={() => handleScan(MOCKED_BARCODE)} title="Scanner" />
        <View style={styles.scanArea} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  camera: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
});
