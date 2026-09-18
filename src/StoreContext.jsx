import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const StoreContext = createContext();

export function useStoreSelector() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');

  const loadStores = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'paginaInicial'));
      const storesData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setStores(storesData);

      setSelectedStoreId((currentSelectedStoreId) => {
        if (
          currentSelectedStoreId &&
          storesData.some((store) => store.id === currentSelectedStoreId)
        ) {
          return currentSelectedStoreId;
        }

        return storesData.length > 0 ? storesData[0].id : '';
      });
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const value = useMemo(
    () => ({
      stores,
      selectedStoreId,
      setSelectedStoreId,
      hasSelectedStore: !!selectedStoreId,
      reloadStores: loadStores,
    }),
    [stores, selectedStoreId]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}