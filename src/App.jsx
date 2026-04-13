import React, { createContext, useContext, useMemo, useState } from 'react';
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
  useListContext,
  SelectInput,
} from 'react-admin';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
import { Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
const productFilters = [
  <TextInput key="q" source="q" label="Pesquisar" alwaysOn />,
  <TextInput key="categoria" source="categoria" label="Categoria" />,
  <TextInput key="marca" source="marca" label="Marca" />,
  <TextInput key="tag" source="tag" label="Tag" />,
];
const i18nProvider = polyglotI18nProvider(() => portugueseMessages, 'pt');

const uploadSingleImage = async (file, path) => {
  const storage = getStorage();
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
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
          value={selectedStoreId ?? 'all'}
          label="Loja"
          onChange={(e) => setSelectedStoreId(e.target.value)}
        >
          <MenuItem value="all">Todas</MenuItem>
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
  const stores = fakeDb.store || [];
  const [selectedStoreId, setSelectedStoreId] = useState(
    stores.length > 0 ? stores[0].id : 'all'
  );

  const value = useMemo(
    () => ({
      stores,
      selectedStoreId,
      setSelectedStoreId,
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
      <StoreSelector />
    </TopToolbar>
  );
}

/* =========================
   BANCO FAKE COM storeId
========================= */

const fakeDb = {
  paginaInicial: [
    {
      id: 1,
      iconeLoja: 'icone.png',
      telefoneLigacoes: '(11) 1111-1111',
      whatsapp: '(11) 99999-9999',
      entregaGratis: true,
      entregaGratisPreco: '199.90',
      imagensCarrossel: 'banner1.png, banner2.png',
      textoCarrossel: 'Bem-vindo à loja',
      textoBotaoCarrossel: 'Comprar agora',
      imagensCarrosselLogos: 'logo1.png, logo2.png',
      corDosBotoes: '#ff0000',
    },
  ],
  sobreNos: [
    {
      id: 1,
      storeId: 1,
      titulo: 'Sobre nossa loja',
      descricao: 'Aqui vai o texto sobre a empresa.',
    },
    {
      id: 2,
      storeId: 2,
      titulo: 'Sobre nossa segunda loja',
      descricao: 'Texto da segunda loja.',
    },
  ],
  products: [
  {
    id: 1,
    idNome: '123456789',
    storeId: 1,
    name: 'Produto Teste 1',
    preco: '99.90',
    precoRiscado: '129.90',
    descricao: 'Descrição do produto teste 1',
    categoria: 'Categoria 1',
    marca: 'Marca 1',
    tags: ['Tag 1', 'Promoção'],
    imagens: [],
    peso: '1kg',
    dimensoes: '10x20x30cm',
    materiais: 'Plástico',
    outrasInformacoes: 'Informações extras do produto',
  },
  {
    id: 2,
    idNome: '987654321',
    storeId: 1,
    name: 'Produto Teste 2',
    preco: '59.90',
    precoRiscado: '79.90',
    descricao: 'Descrição do produto teste 2',
    categoria: 'Categoria 1',
    marca: 'Marca 1',
    tags: ['Tag 2'],
    imagens: [],
    peso: '500g',
    dimensoes: '5x10x15cm',
    materiais: 'Metal',
    outrasInformacoes: 'Informações adicionais',
  },
],
  categorias: [
    { id: 1, storeId: 1, name: 'Categoria 1' },
    { id: 2, storeId: 2, name: 'Categoria 2' },
  ],
  marcas: [
    { id: 1, storeId: 1, name: 'Marca 1' },
    { id: 2, storeId: 2, name: 'Marca 2' },
  ],
  tags: [
    { id: 1, storeId: 1, name: 'Tag 1' },
    { id: 2, storeId: 2, name: 'Tag 2' },
  ],
  store: [
    {
      id: 1,
      nomeLoja: 'Minha Loja',
      email: 'contato@minhaloja.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua Exemplo, 123',
    },
    {
      id: 2,
      nomeLoja: 'Minha Loja 2',
      email: 'contato2@minhaloja.com',
      telefone: '(11) 98888-8888',
      endereco: 'Av Exemplo, 456',
    },
  ],
};

/* =========================
   DATA PROVIDER COM FILTRO POR LOJA
========================= */

const resourcesWithStoreFilter = ['sobreNos', 'products', 'categorias', 'marcas', 'tags'];

const dataProvider = {
  getList: async (resource, params) => {
  let data = fakeDb[resource] || [];
  const filter = params?.filter || {};

  if (
    resourcesWithStoreFilter.includes(resource) &&
    filter.storeId != null &&
    filter.storeId !== 'all'
  ) {
    data = data.filter((item) => item.storeId === filter.storeId);
  }

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
        ).toLowerCase().includes(q)
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

  return Promise.resolve({
    data,
    total: data.length,
  });
},

  getOne: async (resource, params) => {
    const data = fakeDb[resource]?.find((item) => item.id === Number(params.id));
    return Promise.resolve({
      data: data || { id: params.id },
    });
  },

  getMany: async (resource, params) => {
    const data = (fakeDb[resource] || []).filter((item) =>
      params.ids.includes(item.id)
    );
    return Promise.resolve({ data });
  },

  getManyReference: async (resource, params) => {
    let data = fakeDb[resource] || [];

    if (params?.filter?.storeId != null) {
      data = data.filter((item) => item.storeId === params.filter.storeId);
    }

    return Promise.resolve({
      data,
      total: data.length,
    });
  },

  create: async (resource, params) => {
    const newItem = {
      id: Date.now(),
      ...params.data,
    };
    fakeDb[resource] = [...(fakeDb[resource] || []), newItem];
    return Promise.resolve({ data: newItem });
  },

  update: async (resource, params) => {
    fakeDb[resource] = (fakeDb[resource] || []).map((item) =>
      item.id === params.id ? { ...item, ...params.data } : item
    );

    return Promise.resolve({
      data: { id: params.id, ...params.data },
    });
  },

  updateMany: async () => {
    return Promise.resolve({ data: [] });
  },

  delete: async (resource, params) => {
    fakeDb[resource] = (fakeDb[resource] || []).filter(
      (item) => item.id !== params.id
    );
    return Promise.resolve({
      data: params.previousData,
    });
  },

  deleteMany: async () => {
    return Promise.resolve({ data: [] });
  },
};

/* =========================
   COMPONENTES AUXILIARES
========================= */

function StoreFilteredList(props) {
  const { selectedStoreId } = useStoreSelector();

  const storeFilter =
    selectedStoreId && selectedStoreId !== 'all'
      ? { storeId: selectedStoreId }
      : {};

  return (
    <List
      {...props}
      filter={storeFilter}
      actions={<ListActionsWithStoreSelector />}
    >
      {props.children}
    </List>
  );
}

function StoreCreateWrapper({ title, children }) {
  const { selectedStoreId } = useStoreSelector();

  const transform = async (data) => ({
    ...data,
    storeId: selectedStoreId,
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
    <List title="Página Inicial - Lojas">
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="nomeLoja" label="Nome da Loja" />
        <TextField source="email" label="E-mail" />
        <TextField source="telefone" label="Telefone" />
        <TextField source="endereco" label="Endereço" />
        <TextField source="telefoneLigacoes" label="Telefone Ligações" />
        <TextField source="whatsapp" label="Whatsapp" />
        <TextField source="textoCarrossel" label="Texto Carrossel" />
        <TextField source="textoBotaoCarrossel" label="Texto Botão Carrossel" />
        <TextField source="corDosBotoes" label="Cor dos Botões" />
        <EditButton />
      </Datagrid>
    </List>
  );
}

function PaginaInicialCreate() {
  const transform = async (data) => {
    const lojaId =
      data.id ||
      data.nomeLoja?.toLowerCase().replace(/\s+/g, "-") ||
      crypto.randomUUID();

    let iconeLoja = "";
    let imagensCarrossel = [];
    let imagensCarrosselLogos = [];

    if (data.iconeLoja?.rawFile) {
      const file = data.iconeLoja.rawFile;
      const extension = file.name.split(".").pop();
      const uploaded = await uploadSingleImage(
        file,
        `lojas/${lojaId}/iconeLoja/icone.${extension}`
      );
      iconeLoja = uploaded.url;
    }

    if (Array.isArray(data.imagensCarrossel)) {
      const novasImagens = data.imagensCarrossel.filter((img) => img.rawFile);

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${lojaId}/carrossel`
        );
        imagensCarrossel = uploaded.map((item) => item.url);
      }
    }

    if (Array.isArray(data.imagensCarrosselLogos)) {
      const novasImagens = data.imagensCarrosselLogos.filter((img) => img.rawFile);

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${lojaId}/carrosselLogos`
        );
        imagensCarrosselLogos = uploaded.map((item) => item.url);
      }
    }

    return {
      ...data,
      id: lojaId,
      iconeLoja,
      imagensCarrossel,
      imagensCarrosselLogos,
    };
  };

  return (
    <Create title="Criar Página Inicial" transform={transform}>
      <SimpleForm>
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />
        <TextInput source="endereco" label="Endereço" fullWidth />

        <ImageInput source="iconeLoja" label="Ícone da loja" accept="image/*">
          <ImageField source="src" title="title" />
        </ImageInput>

        <TextInput source="telefoneLigacoes" label="Telefone ligações (ddd e número)" fullWidth />
        <TextInput source="whatsapp" label="Whatsapp (ddd e número)" fullWidth />
        <BooleanInput source="entregaGratis" label="Entrega grátis" />
        <TextInput source="entregaGratisPreco" label="Entrega grátis preço" fullWidth />

        <ImageInput source="imagensCarrossel" label="Imagens Carrossel" accept="image/*" multiple>
          <ImageField source="src" title="title" />
        </ImageInput>

        <TextInput source="textoCarrossel" label="Texto Carrossel" fullWidth />
        <TextInput source="textoBotaoCarrossel" label="Texto botão carrossel" fullWidth />

        <ImageInput source="imagensCarrosselLogos" label="ImgsCarrosselLogos" accept="image/*" multiple>
          <ImageField source="src" title="title" />
        </ImageInput>

        <TextInput source="corDosBotoes" label="Cor dos Botões" type="color" />
      </SimpleForm>
    </Create>
  );
}

function PaginaInicialEdit() {
  const transform = async (data) => {
    const lojaId = data.id;

    let novoIconeLoja = data.iconeLoja;
    let novasImagensCarrossel = data.imagensCarrossel;
    let novasImagensCarrosselLogos = data.imagensCarrosselLogos;

    if (data.iconeLoja?.rawFile) {
      const file = data.iconeLoja.rawFile;
      const extension = file.name.split(".").pop();
      const path = `lojas/${lojaId}/iconeLoja/icone.${extension}`;
      const uploaded = await uploadSingleImage(file, path);
      novoIconeLoja = uploaded.url;
    } else if (data.iconeLoja?.src) {
      novoIconeLoja = data.iconeLoja.src;
    }

    if (Array.isArray(data.imagensCarrossel)) {
      const imagensExistentes = data.imagensCarrossel
        .filter((img) => !img.rawFile)
        .map((img) => img.src || img);

      const novasImagens = data.imagensCarrossel.filter((img) => img.rawFile);

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${lojaId}/carrossel`
        );

        novasImagensCarrossel = [
          ...imagensExistentes,
          ...uploaded.map((item) => item.url),
        ];
      } else {
        novasImagensCarrossel = imagensExistentes;
      }
    }

    if (Array.isArray(data.imagensCarrosselLogos)) {
      const imagensExistentes = data.imagensCarrosselLogos
        .filter((img) => !img.rawFile)
        .map((img) => img.src || img);

      const novasImagens = data.imagensCarrosselLogos.filter((img) => img.rawFile);

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

  return (
    <Edit title="Editar Página Inicial" transform={transform}>
      <SimpleForm>
        <ImageInput source="iconeLoja" label="Ícone da loja" accept="image/*">
          <ImageField source="src" title="title" />
        </ImageInput>

        <TextInput source="telefoneLigacoes" label="Telefone ligações (ddd e número)" fullWidth />
        <TextInput source="whatsapp" label="Whatsapp (ddd e número)" fullWidth />
        <BooleanInput source="entregaGratis" label="Entrega grátis" />
        <TextInput source="entregaGratisPreco" label="Entrega grátis preço" fullWidth />

        <ImageInput source="imagensCarrossel" label="Imagens Carrossel" accept="image/*" multiple>
          <ImageField source="src" title="title" />
        </ImageInput>

        <TextInput source="textoCarrossel" label="Texto Carrossel" fullWidth />
        <TextInput source="textoBotaoCarrossel" label="Texto botão carrossel" fullWidth />

        <ImageInput source="imagensCarrosselLogos" label="ImgsCarrosselLogos" accept="image/*" multiple>
          <ImageField source="src" title="title" />
        </ImageInput>

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
        <TextField source="titulo" label="Título" />
        <TextField source="descricao" label="Descrição" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function SobreNosEdit() {
  return (
    <StoreEditWrapper title="Editar Sobre nós">
      <TextInput source="titulo" label="Título" fullWidth />
      <TextInput source="descricao" label="Descrição" multiline fullWidth />
    </StoreEditWrapper>
  );
}

function SobreNosCreate() {
  return (
    <StoreCreateWrapper title="Criar Sobre nós">
      <TextInput source="titulo" label="Título" fullWidth />
      <TextInput source="descricao" label="Descrição" multiline fullWidth />
    </StoreCreateWrapper>
  );
}

/* =========================
   PRODUTOS
========================= */

function ProductList() {
  const { selectedStoreId } = useStoreSelector();

  const storeFilter =
    selectedStoreId && selectedStoreId !== 'all'
      ? { storeId: selectedStoreId }
      : {};

  return (
    <List
      title="Produtos"
      filters={productFilters}
      filter={storeFilter}
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
        <TextField source="storeId" label="IdLoja" />
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
        <TextInput source="categoria" label="Categoria" fullWidth />
        <TextInput source="marca" label="Marca" fullWidth />

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
        <TextInput source="storeId" label="IdLoja" fullWidth disabled />
      </SimpleForm>
    </Edit>
  );
}

function ProductCreate() {
  const { selectedStoreId } = useStoreSelector();

  const transform = async (data) => {
    const productId = data.idNome || crypto.randomUUID();

    let imagens = [];

    if (Array.isArray(data.imagens)) {
      const novasImagens = data.imagens.filter((img) => img.rawFile);

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${selectedStoreId}/produtos/${productId}`
        );
        imagens = uploaded.map((item) => item.url);
      }
    }

    return {
      ...data,
      idNome: data.idNome,
      imagens,
      storeId: selectedStoreId,
    };
  };

  return (
    <Create title="Criar Produto" transform={transform}>
      <SimpleForm>
        <TextInput source="idNome" label="Código de Barras" fullWidth />
        <TextInput source="name" label="Nome" fullWidth />
        <TextInput source="preco" label="Preço" fullWidth />
        <TextInput source="precoRiscado" label="Preço Riscado" fullWidth />
        <TextInput source="descricao" label="Descrição" multiline fullWidth />
        <TextInput source="categoria" label="Categoria" fullWidth />
        <TextInput source="marca" label="Marca" fullWidth />

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
        <TextInput source="storeId" label="IdLoja" fullWidth disabled />
      </SimpleForm>
    </Create>
  );
}

/* =========================
   CATEGORIAS
========================= */

function CategoryList() {
  return (
    <StoreFilteredList title="Categorias">
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function CategoryEdit() {
  return (
    <StoreEditWrapper title="Editar Categoria">
      <TextInput source="name" label="Nome" fullWidth />
    </StoreEditWrapper>
  );
}

function CategoryCreate() {
  return (
    <StoreCreateWrapper title="Criar Categoria">
      <TextInput source="name" label="Nome" fullWidth />
    </StoreCreateWrapper>
  );
}

/* =========================
   MARCAS
========================= */

function BrandList() {
  return (
    <StoreFilteredList title="Marca">
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function BrandEdit() {
  return (
    <StoreEditWrapper title="Editar Marca">
      <TextInput source="name" label="Nome" fullWidth />
    </StoreEditWrapper>
  );
}

function BrandCreate() {
  return (
    <StoreCreateWrapper title="Criar Marca">
      <TextInput source="name" label="Nome" fullWidth />
    </StoreCreateWrapper>
  );
}

/* =========================
   TAGS
========================= */

function TagList() {
  return (
    <StoreFilteredList title="Tags">
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
      </Datagrid>
    </StoreFilteredList>
  );
}

function TagEdit() {
  return (
    <StoreEditWrapper title="Editar Tag">
      <TextInput source="name" label="Nome" fullWidth />
    </StoreEditWrapper>
  );
}

function TagCreate() {
  return (
    <StoreCreateWrapper title="Criar Tag">
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
      >
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