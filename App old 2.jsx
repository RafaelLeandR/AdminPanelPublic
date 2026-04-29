import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  Admin,
  Resource,
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  ImageInput,
  ImageField,
  EditButton,
  TopToolbar,
  Layout,
  CustomRoutes,
  useNotify,
useRedirect,
CreateButton,
  AutocompleteInput,
  AutocompleteArrayInput,
  ReferenceInput,
  ReferenceArrayInput,
} from 'react-admin';
import { CroppedImageInput, BannerCarouselInput } from './images';
import imageCompression from 'browser-image-compression';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
import authProvider from './authProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import portugueseMessages from 'ra-language-portuguese';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import RegisterPage from './Register';
import MyLoginPage from './MyLoginPage';
import InfoIcon from '@mui/icons-material/Info';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StoreIcon from '@mui/icons-material/Store';
import {
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from '@mui/material';
import CustomAppBar from './CustomAppBar';
import MinhaContaPage from './MinhaContaPage';

const CustomLayout = (props) => <Layout {...props} appBar={CustomAppBar} />;

const optimizeImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    return file;
  }
};

const simpleSearchFilter = [
  <TextInput key="q" source="q" label="Pesquisar" alwaysOn />,
];

const productFilters = [
  <TextInput key="q" source="q" label="Pesquisar" alwaysOn />,
  <TextInput key="categoria" source="categoria" label="Categoria" />,
  <TextInput key="marca" source="marca" label="Marca" />,
  <TextInput key="tag" source="tag" label="Tag" />,
];

const i18nProvider = polyglotI18nProvider(() => portugueseMessages, 'pt');

const uploadSingleImage = async (file, path) => {
  const storageRef = ref(storage, path);
  const optimizedFile = await optimizeImage(file);

  await uploadBytes(storageRef, optimizedFile);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    path: storageRef.fullPath,
  };
};

const uploadMultipleImages = async (files, basePath) => {
  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const fileName = `${Date.now()}-${index}-${file.name}`;
      const fullPath = `${basePath}/${fileName}`;
      return uploadSingleImage(file, fullPath);
    })
  );

  return uploads;
};

/* =========================
   CONTEXTO DA LOJA SELECIONADA
========================= */

const StoreContext = createContext();

function useStoreSelector() {
  return useContext(StoreContext);
}

function StoreSelector() {
  const { stores, selectedStoreId, setSelectedStoreId } = useStoreSelector();

  if (!stores || stores.length === 0) return null;

  return (
    <Box sx={{ minWidth: 240, p: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="store-select-label">Loja</InputLabel>
        <Select
          labelId="store-select-label"
          value={selectedStoreId || ''}
          label="Loja"
          onChange={(e) => setSelectedStoreId(e.target.value)}
        >
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.nomeLoja}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

function StoreProvider({ children }) {
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

function ListActionsWithStoreSelector() {
  return (
    <TopToolbar>
      <CreateButton />
      <StoreSelector />
    </TopToolbar>
  );
}

/* =========================
   DATA PROVIDER COM FIRESTORE
========================= */

const resourcesWithStoreFilter = [
  'sobreNos',
  'products',
  'categorias',
  'marcas',
  'tags',
];

const dataProvider = {
  getList: async (resource, params) => {
    const filter = params?.filter || {};
    let collectionRef = collection(db, resource);
    let firestoreQuery = collectionRef;

    if (resourcesWithStoreFilter.includes(resource) && filter.storeId) {
      firestoreQuery = query(
        collectionRef,
        where('storeId', '==', String(filter.storeId))
      );
    }

    const snapshot = await getDocs(firestoreQuery);

    let data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (resource === 'products') {
      if (filter.q) {
        const q = String(filter.q).toLowerCase();
        data = data.filter((item) =>
          String(item.id ?? '').toLowerCase().includes(q) ||
          String(item.idNome ?? '').toLowerCase().includes(q) ||
          String(item.name ?? '').toLowerCase().includes(q) ||
          String(item.descricao ?? '').toLowerCase().includes(q) ||
          String(item.categoria ?? '').toLowerCase().includes(q) ||
          String(item.marca ?? '').toLowerCase().includes(q) ||
          String(
            Array.isArray(item.tags) ? item.tags.join(' ') : item.tags ?? ''
          )
            .toLowerCase()
            .includes(q)
        );
      }

      if (filter.categoria) {
        data = data.filter((item) => item.categoria === filter.categoria);
      }

      if (filter.marca) {
        data = data.filter((item) => item.marca === filter.marca);
      }

      if (filter.tag) {
        data = data.filter((item) =>
          Array.isArray(item.tags)
            ? item.tags.includes(filter.tag)
            : item.tags === filter.tag
        );
      }
    }

    if (resource === 'categorias' && filter.q) {
      const q = String(filter.q).toLowerCase();
      data = data.filter(
        (item) =>
          String(item.id ?? '').toLowerCase().includes(q) ||
          String(item.name ?? '').toLowerCase().includes(q)
      );
    }

    if (resource === 'marcas' && filter.q) {
      const q = String(filter.q).toLowerCase();
      data = data.filter(
        (item) =>
          String(item.id ?? '').toLowerCase().includes(q) ||
          String(item.name ?? '').toLowerCase().includes(q)
      );
    }

    if (resource === 'tags' && filter.q) {
      const q = String(filter.q).toLowerCase();
      data = data.filter(
        (item) =>
          String(item.id ?? '').toLowerCase().includes(q) ||
          String(item.name ?? '').toLowerCase().includes(q)
      );
    }

    if (resource === 'paginaInicial' && filter.q) {
      const q = String(filter.q).toLowerCase();
      data = data.filter(
        (item) =>
          String(item.id ?? '').toLowerCase().includes(q) ||
          String(item.nomeLoja ?? '').toLowerCase().includes(q) ||
          String(item.email ?? '').toLowerCase().includes(q) ||
          String(item.telefone ?? '').toLowerCase().includes(q) ||
          String(item.endereco ?? '').toLowerCase().includes(q) ||
          String(item.whatsapp ?? '').toLowerCase().includes(q) ||
          String(item.textoCarrossel ?? '').toLowerCase().includes(q)
      );
    }

    return {
      data,
      total: data.length,
    };
  },

  getOne: async (resource, params) => {
    const docRef = doc(db, resource, String(params.id));
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return { data: { id: params.id } };
    }

    return {
      data: {
        id: snapshot.id,
        ...snapshot.data(),
      },
    };
  },

  getMany: async (resource, params) => {
    const docsData = await Promise.all(
      params.ids.map(async (id) => {
        const snap = await getDoc(doc(db, resource, String(id)));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      })
    );

    return {
      data: docsData.filter(Boolean),
    };
  },

  getManyReference: async (resource, params) => {
    let firestoreQuery = collection(db, resource);

    if (params?.filter?.storeId) {
      firestoreQuery = query(
        collection(db, resource),
        where('storeId', '==', String(params.filter.storeId))
      );
    }

    const snapshot = await getDocs(firestoreQuery);
    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return {
      data,
      total: data.length,
    };
  },

  create: async (resource, params) => {
  const data = { ...params.data };

  if (data.storeId != null) {
    data.storeId = String(data.storeId);
  }

  // paginaInicial usa id manual da loja
  if (resource === 'paginaInicial' && data.id) {
    await setDoc(doc(db, resource, String(data.id)), data);

    return {
      data: {
        id: String(data.id),
        ...data,
      },
    };
  }

  // sobreNos: só um por loja
  if (resource === 'sobreNos') {
    if (!data.storeId) {
      throw new Error('Selecione uma loja para criar o Sobre nós.');
    }

    const existingQuery = query(
      collection(db, 'sobreNos'),
      where('storeId', '==', String(data.storeId))
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error('Já existe um "Sobre nós" para esta loja.');
    }

    const docRef = await addDoc(collection(db, resource), data);

    return {
      data: {
        id: docRef.id,
        ...data,
      },
    };
  }

  // categorias, marcas, tags, produtos...
  const docRef = await addDoc(collection(db, resource), data);

  return {
    data: {
      id: docRef.id,
      ...data,
    },
  };
},

  update: async (resource, params) => {
    const docRef = doc(db, resource, String(params.id));
    const data = { ...params.data };

    if (data.storeId != null) {
      data.storeId = String(data.storeId);
    }

    await updateDoc(docRef, data);

    return {
      data: {
        id: String(params.id),
        ...data,
      },
    };
  },

  updateMany: async (resource, params) => {
    await Promise.all(
      params.ids.map((id) =>
        updateDoc(doc(db, resource, String(id)), params.data)
      )
    );

    return { data: params.ids };
  },

  delete: async (resource, params) => {
    await deleteDoc(doc(db, resource, String(params.id)));

    return {
      data: params.previousData,
    };
  },

  deleteMany: async (resource, params) => {
    await Promise.all(
      params.ids.map((id) => deleteDoc(doc(db, resource, String(id))))
    );

    return { data: params.ids };
  },
};

/* =========================
   COMPONENTES AUXILIARES
========================= */

function StoreRequiredMessage({ title = 'Selecione uma loja' }) {
  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Você precisa selecionar uma loja para continuar.
      </Typography>
      <StoreSelector />
    </Box>
  );
}

function StoreFilteredList(props) {
  const { selectedStoreId } = useStoreSelector();

  return (
    <List
      {...props}
      filter={selectedStoreId ? { storeId: selectedStoreId } : {}}
      actions={<ListActionsWithStoreSelector />}
    >
      {props.children}
    </List>
  );
}

function StoreCreateWrapper({ title, children }) {
  const { selectedStoreId } = useStoreSelector();

  if (!selectedStoreId) {
    return <StoreRequiredMessage title="Selecione uma loja antes de criar" />;
  }

  const transform = async (data) => ({
    ...data,
    storeId: String(data.storeId || selectedStoreId),
  });

  return (
    <Create title={title} transform={transform}>
      <SimpleForm>{children}</SimpleForm>
    </Create>
  );
}

function StoreEditWrapper({ title, children }) {
  return (
    <Edit title={title}>
      <SimpleForm>{children}</SimpleForm>
    </Edit>
  );
}

/* =========================
   PÁGINA INICIAL
========================= */

function PaginaInicialList() {
  return (
    <List title="Página Inicial - Lojas" filters={simpleSearchFilter}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="nomeLoja" label="Nome da Loja" />
        <TextField source="email" label="E-mail" />
        <TextField source="telefone" label="Telefone" />
        <TextField source="endereco" label="Endereço" />
        <TextField source="telefoneLigacoes" label="Telefone Ligações" />
        <TextField source="whatsapp" label="Whatsapp" />
        <TextField source="textoCarrossel" label="Texto Carrossel" />
        <TextField
          source="textoBotaoCarrossel"
          label="Texto Botão Carrossel"
        />
        <TextField source="corDosBotoes" label="Cor dos Botões" />
        <EditButton />
      </Datagrid>
    </List>
  );
}

function PaginaInicialCreate() {
  const notify = useNotify();
  const redirect = useRedirect();
  const { reloadStores } = useStoreSelector();

  const transform = async (data) => ({
  ...data,
  storeId: String(data.storeId || selectedStoreId),
});

  const onSuccess = async () => {
    await reloadStores();
    notify('Loja criada com sucesso!');
    redirect('/paginaInicial');
  };

  return (
    <Create title="Criar Página Inicial" transform={transform} mutationOptions={{ onSuccess }}>
      <SimpleForm>
        <TextInput source="id" label="ID da Loja" fullWidth />
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />
        <TextInput source="endereco" label="Endereço" fullWidth />

        <CroppedImageInput
          source="iconeLoja"
          label="Ícone da loja"
          type="logo"
        />

        <TextInput
          source="telefoneLigacoes"
          label="Telefone ligações (ddd e número)"
          fullWidth
        />
        <TextInput
          source="whatsapp"
          label="Whatsapp (ddd e número)"
          fullWidth
        />
        <BooleanInput source="entregaGratis" label="Entrega grátis" />
        <TextInput
          source="entregaGratisPreco"
          label="Entrega grátis preço"
          fullWidth
        />

        <BannerCarouselInput
          source="imagensCarrossel"
          label="Imagens Carrossel"
        />

        <TextInput source="textoCarrossel" label="Texto Carrossel" fullWidth />
        <TextInput
          source="textoBotaoCarrossel"
          label="Texto botão carrossel"
          fullWidth
        />

        <CroppedImageInput
          source="imagensCarrosselLogos"
          label="ImgsCarrosselLogos"
          type="banner"
          multiple
        />

        <TextInput source="corDosBotoes" label="Cor dos Botões" type="color" />
      </SimpleForm>
    </Create>
  );
}

function PaginaInicialEdit() {
  const notify = useNotify();
  const { reloadStores } = useStoreSelector();

  const transform = async (data) => {
    const lojaId = data.id;

    let novoIconeLoja = data.iconeLoja;
    let novasImagensCarrossel = data.imagensCarrossel;
    let novasImagensCarrosselLogos = data.imagensCarrosselLogos;

    if (data.iconeLoja?.rawFile) {
      const file = data.iconeLoja.rawFile;
      const extension = file.name.split('.').pop();
      const path = `lojas/${lojaId}/iconeLoja/icone.${extension}`;
      const uploaded = await uploadSingleImage(file, path);
      novoIconeLoja = uploaded.url;
    } else if (data.iconeLoja?.src) {
      novoIconeLoja = data.iconeLoja.src;
    }

    if (Array.isArray(data.imagensCarrossel)) {
      const imagensExistentes = data.imagensCarrossel
        .filter((img) => !img.rawFile)
        .map((img) => ({
          src: img.src || img,
          link: img.link || '',
        }));

      const novasImagens = data.imagensCarrossel.filter((img) => img.rawFile);

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${lojaId}/carrossel`
        );

        novasImagensCarrossel = [
          ...imagensExistentes,
          ...uploaded.map((item, index) => ({
            src: item.url,
            link: novasImagens[index]?.link || '',
          })),
        ];
      } else {
        novasImagensCarrossel = imagensExistentes;
      }
    }

    if (Array.isArray(data.imagensCarrosselLogos)) {
      const imagensExistentes = data.imagensCarrosselLogos
        .filter((img) => !img.rawFile)
        .map((img) => img.src || img);

      const novasImagens = data.imagensCarrosselLogos.filter(
        (img) => img.rawFile
      );

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${lojaId}/carrosselLogos`
        );

        novasImagensCarrosselLogos = [
          ...imagensExistentes,
          ...uploaded.map((item) => item.url),
        ];
      } else {
        novasImagensCarrosselLogos = imagensExistentes;
      }
    }

    return {
      ...data,
      iconeLoja: novoIconeLoja,
      imagensCarrossel: novasImagensCarrossel,
      imagensCarrosselLogos: novasImagensCarrosselLogos,
    };
  };

  const onSuccess = async () => {
    await reloadStores();
    notify('Loja atualizada com sucesso!');
  };

  return (
    <Edit title="Editar Página Inicial" transform={transform} mutationOptions={{ onSuccess }}>
      <SimpleForm>
        <TextInput source="id" label="ID da Loja" fullWidth disabled />
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />
        <TextInput source="endereco" label="Endereço" fullWidth />

        <CroppedImageInput
          source="iconeLoja"
          label="Ícone da loja"
          type="logo"
        />

        <TextInput
          source="telefoneLigacoes"
          label="Telefone ligações (ddd e número)"
          fullWidth
        />
        <TextInput
          source="whatsapp"
          label="Whatsapp (ddd e número)"
          fullWidth
        />
        <BooleanInput source="entregaGratis" label="Entrega grátis" />
        <TextInput
          source="entregaGratisPreco"
          label="Entrega grátis preço"
          fullWidth
        />

        <BannerCarouselInput
          source="imagensCarrossel"
          label="Imagens Carrossel"
        />

        <TextInput source="textoCarrossel" label="Texto Carrossel" fullWidth />
        <TextInput
          source="textoBotaoCarrossel"
          label="Texto botão carrossel"
          fullWidth
        />

        <CroppedImageInput
          source="imagensCarrosselLogos"
          label="ImgsCarrosselLogos"
          type="banner"
          multiple
        />

        <TextInput
          source="corDosBotoes"
          label="Cor Dos Botoes: clique na cor para mudá-la"
          type="color"
          fullWidth
        />
      </SimpleForm>
    </Edit>
  );
}

/* =========================
   SOBRE NÓS
========================= */

function SobreNosList() {
  return (
    <StoreFilteredList title="Sobre nós">
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="storeId" label="ID da Loja" />
        <TextField source="titulo" label="Título" />
        <TextField source="descricao" label="Descrição" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function SobreNosEdit() {
  return (
    <Edit title="Editar Sobre nós">
      <SimpleForm>
        <Box sx={{ width: '100%', mb: 2 }}>
          <StoreSelector />
        </Box>
        <TextInput source="storeId" label="ID da Loja" fullWidth />
        <TextInput source="titulo" label="Título" fullWidth />
        <TextInput source="descricao" label="Descrição" multiline fullWidth />
      </SimpleForm>
    </Edit>
  );
}

function SobreNosCreate() {
  const { selectedStoreId, stores } = useStoreSelector();
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [alreadyExists, setAlreadyExists] = useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      if (!selectedStoreId) {
        setAlreadyExists(false);
        setLoadingCheck(false);
        return;
      }

      setLoadingCheck(true);

      try {
        const q = query(
          collection(db, 'sobreNos'),
          where('storeId', '==', String(selectedStoreId))
        );
        const snapshot = await getDocs(q);
        setAlreadyExists(!snapshot.empty);
      } catch (error) {
        console.error('Erro ao verificar Sobre nós da loja:', error);
        setAlreadyExists(false);
      } finally {
        setLoadingCheck(false);
      }
    };

    checkExisting();
  }, [selectedStoreId]);

  if (!stores.length) {
    return (
      <Box p={3}>
        <Typography variant="h6">Nenhuma loja encontrada</Typography>
        <Typography>Cadastre uma loja antes de criar o Sobre nós.</Typography>
      </Box>
    );
  }

  if (!selectedStoreId) {
    return (
      <StoreRequiredMessage title="Selecione uma loja antes de criar o Sobre nós" />
    );
  }

  if (loadingCheck) {
    return (
      <Box p={3}>
        <Typography gutterBottom>
          Verificando se já existe um Sobre nós para esta loja...
        </Typography>
        <StoreSelector />
      </Box>
    );
  }

  if (alreadyExists) {
    return (
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Já existe um Sobre nós para esta loja
        </Typography>
        <Typography gutterBottom>
          Se houver outra loja, selecione-a abaixo para criar outro Sobre nós.
        </Typography>
        <StoreSelector />
      </Box>
    );
  }

  const selectedStore = stores.find((store) => store.id === selectedStoreId);

  const transform = async (data) => ({
    ...data,
    storeId: String(selectedStoreId),
  });

  return (
    <Create title="Criar Sobre nós" transform={transform}>
      <SimpleForm>
        <Box sx={{ width: '100%', mb: 2 }}>
          <StoreSelector />
        </Box>

        <TextInput
          source="storeId"
          label="ID da Loja"
          fullWidth
          defaultValue={selectedStoreId}
        />

        <TextInput
          source="nomeLojaSelecionada"
          label="Loja atual"
          fullWidth
          defaultValue={selectedStore?.nomeLoja || ''}
          disabled
        />

        <TextInput source="titulo" label="Título" fullWidth />
        <TextInput source="descricao" label="Descrição" multiline fullWidth />
      </SimpleForm>
    </Create>
  );
}

/* =========================
   PRODUTOS
========================= */

function ProductList() {
  const { selectedStoreId } = useStoreSelector();

  return (
    <List
      title="Produtos"
      filters={productFilters}
      filter={selectedStoreId ? { storeId: selectedStoreId } : {}}
      actions={<ListActionsWithStoreSelector />}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="idNome" label="Código de Barras" />
        <TextField source="name" label="Nome" />
        <TextField source="preco" label="Preço" />
        <TextField source="precoRiscado" label="Preço Riscado" />
        <TextField source="categoria" label="Categoria" />
        <TextField source="marca" label="Marca" />
        <TextField source="tags" label="Tags" />
        <TextField source="peso" label="Peso" />
        <TextField source="dimensoes" label="Dimensões" />
        <TextField source="materiais" label="Materiais" />
        <TextField source="storeId" label="ID da Loja" />
      </Datagrid>
    </List>
  );
}

function ProductEdit() {
  const transform = async (data) => {
    const productId = data.id;

    let novasImagens = data.imagens;

    if (Array.isArray(data.imagens)) {
      const imagensExistentes = data.imagens
        .filter((img) => !img.rawFile)
        .map((img) => img.src || img);

      const imagensNovas = data.imagens.filter((img) => img.rawFile);

      if (imagensNovas.length > 0) {
        const uploaded = await uploadMultipleImages(
          imagensNovas.map((img) => img.rawFile),
          `lojas/${data.storeId}/produtos/${productId}`
        );

        novasImagens = [
          ...imagensExistentes,
          ...uploaded.map((item) => item.url),
        ];
      } else {
        novasImagens = imagensExistentes;
      }
    }

    return {
      ...data,
      imagens: novasImagens,
    };
  };

  return (
    <Edit title="Editar Produto" transform={transform}>
      <SimpleForm>
        <TextInput source="idNome" label="Código de barras" fullWidth />
        <TextInput source="name" label="Nome" fullWidth />
        <TextInput source="preco" label="Preço" fullWidth />
        <TextInput source="precoRiscado" label="Preço Riscado" fullWidth />
        <TextInput source="descricao" label="Descrição" multiline fullWidth />

        <ReferenceInput source="categoriaId" reference="categorias">
          <AutocompleteInput
            label="Categoria"
            optionText="name"
            fullWidth
          />
        </ReferenceInput>

        <ReferenceInput source="marcaId" reference="marcas">
          <AutocompleteInput
            label="Marca"
            optionText="name"
            fullWidth
          />
        </ReferenceInput>

        <ReferenceArrayInput source="tagIds" reference="tags">
          <AutocompleteArrayInput
            label="Tags"
            optionText="name"
            fullWidth
          />
        </ReferenceArrayInput>

        <CroppedImageInput
          source="imagens"
          label="Imagens"
          type="product"
          multiple
        />

        <TextInput source="peso" label="Peso" fullWidth />
        <TextInput source="dimensoes" label="Dimensões" fullWidth />
        <TextInput source="materiais" label="Materiais" multiline fullWidth />
        <TextInput
          source="outrasInformacoes"
          label="Outras Informações"
          multiline
          fullWidth
        />
        <TextInput source="storeId" label="ID da Loja" fullWidth />
      </SimpleForm>
    </Edit>
  );
}

function ProductCreate() {
  const { selectedStoreId } = useStoreSelector();

  if (!selectedStoreId) {
    return (
      <StoreRequiredMessage title="Selecione uma loja antes de criar um produto" />
    );
  }

  const transform = async (data) => {
    const storeId = String(data.storeId || selectedStoreId);
    const productId = data.idNome || crypto.randomUUID();

    let imagens = [];

    if (Array.isArray(data.imagens)) {
      const novasImagens = data.imagens.filter((img) => img.rawFile);

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${storeId}/produtos/${productId}`
        );
        imagens = uploaded.map((item) => item.url);
      }
    }

    return {
      ...data,
      idNome: data.idNome,
      imagens,
      storeId,
    };
  };

  return (
    <Create title="Criar Produto" transform={transform}>
      <SimpleForm>
        <Box sx={{ width: "100%", mb: 2 }}>
          <StoreSelector />
        </Box>

        <TextInput
          source="storeId"
          label="ID da Loja"
          fullWidth
          defaultValue={selectedStoreId}
        />

        <TextInput source="idNome" label="Código de Barras" fullWidth />
        <TextInput source="name" label="Nome" fullWidth />
        <TextInput source="preco" label="Preço" fullWidth />
        <TextInput source="precoRiscado" label="Preço Riscado" fullWidth />
        <TextInput source="descricao" label="Descrição" multiline fullWidth />

        <ReferenceInput source="categoriaId" reference="categorias">
          <AutocompleteInput
            label="Categoria"
            optionText="name"
            fullWidth
          />
        </ReferenceInput>

        <ReferenceInput source="marcaId" reference="marcas">
          <AutocompleteInput
            label="Marca"
            optionText="name"
            fullWidth
          />
        </ReferenceInput>

        <ReferenceArrayInput source="tagIds" reference="tags">
          <AutocompleteArrayInput
            label="Tags"
            optionText="name"
            fullWidth
          />
        </ReferenceArrayInput>

        <ImageInput source="imagens" label="Imagens" accept="image/*" multiple>
          <ImageField source="src" title="title" />
        </ImageInput>

        <TextInput source="peso" label="Peso" fullWidth />
        <TextInput source="dimensoes" label="Dimensões" fullWidth />
        <TextInput source="materiais" label="Materiais" multiline fullWidth />
        <TextInput
          source="outrasInformacoes"
          label="Outras Informações"
          multiline
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
}

/* =========================
   CATEGORIAS
========================= */

function CategoryList() {
  return (
    <StoreFilteredList title="Categorias" filters={simpleSearchFilter}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
        <TextField source="storeId" label="ID da Loja" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function CategoryEdit() {
  return (
    <StoreEditWrapper title="Editar Categoria">
      <TextInput source="storeId" label="ID da Loja" fullWidth />
      <TextInput source="name" label="Nome" fullWidth />
    </StoreEditWrapper>
  );
}

function CategoryCreate() {
  return (
    <StoreCreateWrapper title="Criar Categoria">
      <Box sx={{ width: '100%', mb: 2 }}>
        <StoreSelector />
      </Box>
      <TextInput source="storeId" label="ID da Loja" fullWidth />
      <TextInput source="name" label="Nome" fullWidth />
    </StoreCreateWrapper>
  );
}

/* =========================
   MARCAS
========================= */

function BrandList() {
  return (
    <StoreFilteredList title="Marca" filters={simpleSearchFilter}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
        <TextField source="storeId" label="ID da Loja" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function BrandEdit() {
  return (
    <StoreEditWrapper title="Editar Marca">
      <TextInput source="storeId" label="ID da Loja" fullWidth />
      <TextInput source="name" label="Nome" fullWidth />
    </StoreEditWrapper>
  );
}

function BrandCreate() {
  return (
    <StoreCreateWrapper title="Criar Marca">
      <Box sx={{ width: '100%', mb: 2 }}>
        <StoreSelector />
      </Box>
      <TextInput source="storeId" label="ID da Loja" fullWidth />
      <TextInput source="name" label="Nome" fullWidth />
    </StoreCreateWrapper>
  );
}

/* =========================
   TAGS
========================= */

function TagList() {
  return (
    <StoreFilteredList title="Tags" filters={simpleSearchFilter}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
        <TextField source="storeId" label="ID da Loja" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function TagEdit() {
  return (
    <StoreEditWrapper title="Editar Tag">
      <TextInput source="storeId" label="ID da Loja" fullWidth />
      <TextInput source="name" label="Nome" fullWidth />
    </StoreEditWrapper>
  );
}

function TagCreate() {
  return (
    <StoreCreateWrapper title="Criar Tag">
      <Box sx={{ width: '100%', mb: 2 }}>
        <StoreSelector />
      </Box>
      <TextInput source="storeId" label="ID da Loja" fullWidth />
      <TextInput source="name" label="Nome" fullWidth />
    </StoreCreateWrapper>
  );
}

/* =========================
   STORE
========================= */

function StoreList() {
  return (
    <List title="Store">
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="nomeLoja" label="Nome da Loja" />
        <TextField source="email" label="E-mail" />
        <TextField source="telefone" label="Telefone" />
        <TextField source="endereco" label="Endereço" />
      </Datagrid>
    </List>
  );
}

function StoreEdit() {
  return (
    <Edit title="Editar Store">
      <SimpleForm>
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />
        <TextInput source="endereco" label="Endereço" fullWidth />
      </SimpleForm>
    </Edit>
  );
}

/* =========================
   ADMIN
========================= */

function AdminApp() {
  return (
    <StoreProvider>
      <Admin
        authProvider={authProvider}
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        loginPage={MyLoginPage}
        layout={CustomLayout}
      >
        <CustomRoutes>
          <Route path="/minha-conta" element={<MinhaContaPage />} />
        </CustomRoutes>

        <Resource
          name="paginaInicial"
          list={PaginaInicialList}
          create={PaginaInicialCreate}
          edit={PaginaInicialEdit}
          options={{ label: 'Página Inicial - Lojas' }}
          icon={StoreIcon}
        />

        <Resource
          name="sobreNos"
          list={SobreNosList}
          edit={SobreNosEdit}
          create={SobreNosCreate}
          icon={InfoIcon}
          options={{ label: 'Sobre nós' }}
        />

        <Resource
          name="products"
          list={ProductList}
          edit={ProductEdit}
          create={ProductCreate}
          icon={InventoryIcon}
          options={{ label: 'Produtos' }}
        />

        <Resource
          name="categorias"
          list={CategoryList}
          edit={CategoryEdit}
          create={CategoryCreate}
          icon={CategoryIcon}
          options={{ label: 'Categorias' }}
        />

        <Resource
          name="marcas"
          list={BrandList}
          edit={BrandEdit}
          create={BrandCreate}
          icon={BrandingWatermarkIcon}
          options={{ label: 'Marca' }}
        />

        <Resource
          name="tags"
          list={TagList}
          edit={TagEdit}
          create={TagCreate}
          icon={LocalOfferIcon}
          options={{ label: 'Tags' }}
        />
      </Admin>
    </StoreProvider>
  );
}

/* =========================
   APP
========================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;