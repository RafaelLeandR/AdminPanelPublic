import { db, auth } from './firebase';

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
} from 'firebase/firestore';

const resourcesWithStoreFilter = [
  'sobreNos',
  'products',
  'categorias',
  'marcas',
  'tags',
  'paginaInicial',
];

const impersonateStoreId = localStorage.getItem('impersonateStoreId');

function normalizePrice(value) {
  if (value === null || value === undefined || value === '') return '';

  let stringValue = String(value).trim();
  stringValue = stringValue.replace(/\s/g, '');

  const hasComma = stringValue.includes(',');
  const hasDot = stringValue.includes('.');

  if (hasComma && hasDot) {
    const lastComma = stringValue.lastIndexOf(',');
    const lastDot = stringValue.lastIndexOf('.');

    if (lastComma > lastDot) {
      stringValue = stringValue.replace(/\./g, '').replace(',', '.');
    } else {
      stringValue = stringValue.replace(/,/g, '');
    }
  } else if (hasComma) {
    stringValue = stringValue.replace(/\./g, '').replace(',', '.');
  } else {
    const parts = stringValue.split('.');

    if (parts.length > 2) {
      const decimal = parts.pop();
      stringValue = parts.join('') + '.' + decimal;
    }
  }

  return stringValue;
}

function cleanEmptyFields(obj) {
  const cleaned = { ...obj };

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];

    const isEmptyArray = Array.isArray(value) && value.length === 0;
    const isEmptyString = value === '';
    const isUndefined = value === undefined;
    const isNull = value === null;

    if (isUndefined || isNull || isEmptyString || isEmptyArray) {
      delete cleaned[key];
    }
  });

  return cleaned;
}

function prepareProductData(data) {
  const prepared = { ...data };

  if ('preco' in prepared) {
    prepared.preco = normalizePrice(prepared.preco);
  }

  if ('precoRiscado' in prepared) {
    prepared.precoRiscado = normalizePrice(prepared.precoRiscado);
  }

  if (prepared.ativo === undefined) {
    prepared.ativo = true;
  }

  return cleanEmptyFields(prepared);
}

// Auxiliar para buscar a página inicial da loja logada
async function getPaginaInicialDoc(userId) {
  const lojaId = impersonateStoreId || userId;
  const q = query(
    collection(db, 'paginaInicial'),
    where('storeId', '==', lojaId)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error('Página inicial da loja não encontrada.');
  }
  return snap.docs[0];
}

const dataProvider = {
  getList: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // RECURSO VIRTUAL: VENDEDORAS (lê do array em paginaInicial)
    if (resource === 'vendedoras') {
      const paginaDoc = await getPaginaInicialDoc(user.uid);
      const funcionarios = Array.isArray(paginaDoc.data().funcionarios)
        ? paginaDoc.data().funcionarios
        : [];

      const data = funcionarios.map((func, index) => ({
        id: index,
        ...func,
      }));

      return { data, total: data.length };
    }

    const filter = params?.filter || {};
    const collectionRef = collection(db, resource);
    const constraints = [];

    if (resourcesWithStoreFilter.includes(resource)) {
      constraints.push(
        where('storeId', '==', impersonateStoreId || user.uid)
      );
    }

    if (resource === 'products' && filter.idNome) {
      constraints.push(where('idNome', '==', String(filter.idNome)));
    }

    const firestoreQuery =
      constraints.length > 0
        ? query(collectionRef, ...constraints)
        : collectionRef;

    const snapshot = await getDocs(firestoreQuery);

    let data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (['categorias', 'marcas', 'tags'].includes(resource)) {
      const searchText = String(
        filter.name ?? filter.q ?? ''
      ).toLowerCase().trim();

      if (searchText) {
        data = data.filter((item) =>
          String(item.name ?? '').toLowerCase().includes(searchText)
        );
      }
    }

    if (resource === 'products' && filter.q) {
      const q = String(filter.q).toLowerCase();

      data = data.filter((item) =>
        String(item.id ?? '').toLowerCase().includes(q) ||
        String(item.idNome ?? '').toLowerCase().includes(q) ||
        String(item.name ?? '').toLowerCase().includes(q) ||
        String(item.descricao ?? '').toLowerCase().includes(q) ||
        String(item.categoria ?? '').toLowerCase().includes(q) ||
        String(item.marca ?? '').toLowerCase().includes(q)
      );
    }

    return { data, total: data.length };
  },

  getOne: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // RECURSO VIRTUAL: VENDEDORAS
    if (resource === 'vendedoras') {
      const paginaDoc = await getPaginaInicialDoc(user.uid);
      const funcionarios = Array.isArray(paginaDoc.data().funcionarios)
        ? paginaDoc.data().funcionarios
        : [];
      
      const vendedora = funcionarios[Number(params.id)];
      if (!vendedora) throw new Error('Vendedora não encontrada');

      return {
        data: {
          id: params.id,
          ...vendedora,
        },
      };
    }

    const docRef = doc(db, resource, String(params.id));
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return { data: { id: params.id } };
    }

    const data = snapshot.data();

    if (
      resourcesWithStoreFilter.includes(resource) &&
      data.storeId !== (impersonateStoreId || user.uid)
    ) {
      throw new Error('Acesso negado');
    }

    return {
      data: {
        id: snapshot.id,
        ...data,
      },
    };
  },

  create: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // RECURSO VIRTUAL: VENDEDORAS (criação via addDoc/updateDoc)
    if (resource === 'vendedoras') {
      const paginaDoc = await getPaginaInicialDoc(user.uid);
      const funcionarios = Array.isArray(paginaDoc.data().funcionarios)
        ? paginaDoc.data().funcionarios
        : [];

      const novaVendedora = {
        nome: params.data.nome || '',
        cargo: params.data.cargo || 'Vendedora',
        whatsapp: params.data.whatsapp || '',
        foto: params.data.foto || '',
      };

      const novosFuncionarios = [...funcionarios, novaVendedora];

      await updateDoc(doc(db, 'paginaInicial', paginaDoc.id), {
        funcionarios: novosFuncionarios,
      });

      return {
        data: {
          id: novosFuncionarios.length - 1,
          ...novaVendedora,
        },
      };
    }

    let data = { ...params.data };

    if (resourcesWithStoreFilter.includes(resource)) {
      data.storeId = impersonateStoreId || user.uid;
    }

    if (resource === 'products') {
      data = prepareProductData(data);
    } else {
      data = cleanEmptyFields(data);
    }

    if (resource === 'paginaInicial') {
      const documentId = String(data.id).trim().toLowerCase();
      const finalData = {
        ...data,
        id: documentId,
        storeId: impersonateStoreId || user.uid,
      };

      await setDoc(doc(db, 'paginaInicial', documentId), finalData, { merge: true });

      return {
        data: {
          id: documentId,
          ...finalData,
        },
      };
    }

    if (resource === 'sobreNos') {
      const existingQuery = query(
        collection(db, 'sobreNos'),
        where('storeId', '==', impersonateStoreId || user.uid)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        throw new Error('Já existe um Sobre Nós.');
      }
    }

    const docRef = await addDoc(collection(db, resource), data);

    return {
      data: {
        id: docRef.id,
        ...data,
      },
    };
  },

  update: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // RECURSO VIRTUAL: VENDEDORAS
    if (resource === 'vendedoras') {
      const paginaDoc = await getPaginaInicialDoc(user.uid);
      const funcionarios = Array.isArray(paginaDoc.data().funcionarios)
        ? [...paginaDoc.data().funcionarios]
        : [];

      const index = Number(params.id);
      funcionarios[index] = {
        nome: params.data.nome || '',
        cargo: params.data.cargo || 'Vendedora',
        whatsapp: params.data.whatsapp || '',
        foto: params.data.foto || '',
      };

      await updateDoc(doc(db, 'paginaInicial', paginaDoc.id), {
        funcionarios,
      });

      return {
        data: {
          id: index,
          ...funcionarios[index],
        },
      };
    }

    const docId = String(params.id);
    const docRef = doc(db, resource, docId);
    const currentSnap = await getDoc(docRef);

    if (!currentSnap.exists()) {
      throw new Error('Documento não encontrado');
    }

    const currentData = currentSnap.data();

    if (
      resourcesWithStoreFilter.includes(resource) &&
      currentData.storeId !== (impersonateStoreId || user.uid)
    ) {
      throw new Error('Acesso negado');
    }

    let data = { ...params.data };

    if (resourcesWithStoreFilter.includes(resource)) {
      data.storeId = impersonateStoreId || user.uid;
    }

    if (resource === 'products') {
      data = prepareProductData(data);
    } else {
      data = cleanEmptyFields(data);
    }

    await setDoc(docRef, data, { merge: true });

    return {
      data: {
        id: docId,
        ...data,
      },
    };
  },

  delete: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // RECURSO VIRTUAL: VENDEDORAS
    if (resource === 'vendedoras') {
      const paginaDoc = await getPaginaInicialDoc(user.uid);
      const funcionarios = Array.isArray(paginaDoc.data().funcionarios)
        ? paginaDoc.data().funcionarios
        : [];

      const indexToDelete = Number(params.id);
      const novosFuncionarios = funcionarios.filter((_, index) => index !== indexToDelete);

      await updateDoc(doc(db, 'paginaInicial', paginaDoc.id), {
        funcionarios: novosFuncionarios,
      });

      return { data: params.previousData || { id: params.id } };
    }

    const docRef = doc(db, resource, String(params.id));
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('Documento não encontrado');
    }

    const data = snapshot.data();

    if (
      resourcesWithStoreFilter.includes(resource) &&
      data.storeId !== (impersonateStoreId || user.uid)
    ) {
      throw new Error('Acesso negado');
    }

    await deleteDoc(docRef);

    return { data: params.previousData };
  },

  getMany: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const docsData = await Promise.all(
      params.ids.map(async (id) => {
        const snap = await getDoc(doc(db, resource, String(id)));
        if (!snap.exists()) return null;

        const data = snap.data();
        if (
          resourcesWithStoreFilter.includes(resource) &&
          data.storeId !== (impersonateStoreId || user.uid)
        ) {
          return null;
        }

        return { id: snap.id, ...data };
      })
    );

    return { data: docsData.filter(Boolean) };
  },

  getManyReference: async (resource) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    let firestoreQuery = collection(db, resource);

    if (resourcesWithStoreFilter.includes(resource)) {
      firestoreQuery = query(
        collection(db, resource),
        where('storeId', '==', impersonateStoreId || user.uid)
      );
    }

    const snapshot = await getDocs(firestoreQuery);

    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return { data, total: data.length };
  },

  updateMany: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    await Promise.all(
      params.ids.map(async (id) => {
        const docRef = doc(db, resource, String(id));
        const currentSnap = await getDoc(docRef);

        if (!currentSnap.exists()) return;

        const currentData = currentSnap.data();

        if (
          resourcesWithStoreFilter.includes(resource) &&
          currentData.storeId !== (impersonateStoreId || user.uid)
        ) {
          return;
        }

        let data = { ...params.data };

        if (resourcesWithStoreFilter.includes(resource)) {
          data.storeId = impersonateStoreId || user.uid;
        }

        if (resource === 'products') {
          data = prepareProductData(data);
        } else {
          data = cleanEmptyFields(data);
        }

        await updateDoc(docRef, data);
      })
    );

    return { data: params.ids };
  },

  deleteMany: async (resource, params) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    await Promise.all(
      params.ids.map(async (id) => {
        const docRef = doc(db, resource, String(id));
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return;

        const data = snapshot.data();

        if (
          resourcesWithStoreFilter.includes(resource) &&
          data.storeId !== (impersonateStoreId || user.uid)
        ) {
          return;
        }

        await deleteDoc(docRef);
      })
    );

    return { data: params.ids };
  },
};

export default dataProvider;