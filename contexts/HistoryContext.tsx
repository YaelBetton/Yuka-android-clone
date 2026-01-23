import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  grade?: string;
  image?: string;
  scannedAt: string;
}

interface HistoryContextType {
  history: Product[];
  addToHistory: (product: Omit<Product, 'scannedAt'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  loading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = '@yuka_history';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger l'historique au démarrage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async (product: Omit<Product, 'scannedAt'>) => {
    try {
      const newProduct: Product = {
        ...product,
        scannedAt: new Date().toISOString(),
      };

      // Éviter les doublons (vérifier par barcode)
      const filteredHistory = history.filter(item => item.barcode !== product.barcode);
      
      // Ajouter le nouveau produit en premier
      const updatedHistory = [newProduct, ...filteredHistory].slice(0, 50); // Limite à 50 produits
      
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory, loading }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory doit être utilisé dans un HistoryProvider');
  }
  return context;
}
