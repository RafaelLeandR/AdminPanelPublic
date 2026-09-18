// imports planilha
import { TopToolbar, CreateButton, Button } from 'react-admin';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Link } from 'react-router-dom';
import { auth } from './firebase';
//imports planilha

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ImageInput,
  ImageField,
  ReferenceInput,
  ReferenceArrayInput,
  AutocompleteInput,
  AutocompleteArrayInput,
  BooleanInput,
  BooleanField,
  required,
} from 'react-admin';




import { productFilters } from './filters';
import { uploadMultipleImages } from './imageUpload';
import { CroppedImageInput } from './images';

function normalizePrice(value) {
  if (value === null || value === undefined || value === '') return '';

  let stringValue = String(value).trim();

  // remove espaços
  stringValue = stringValue.replace(/\s/g, '');

  const hasComma = stringValue.includes(',');
  const hasDot = stringValue.includes('.');

  // Caso tenha vírgula e ponto: assume que o último separador é decimal
  if (hasComma && hasDot) {
    const lastComma = stringValue.lastIndexOf(',');
    const lastDot = stringValue.lastIndexOf('.');

    if (lastComma > lastDot) {
      // 1.234,56 -> 1234.56
      stringValue = stringValue.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,234.56 -> 1234.56
      stringValue = stringValue.replace(/,/g, '');
    }
  } else if (hasComma) {
    // 10,50 -> 10.50
    stringValue = stringValue.replace(/\./g, '').replace(',', '.');
  } else {
    // mantém ponto como decimal, remove separador de milhar duplicado se necessário
    const parts = stringValue.split('.');
    if (parts.length > 2) {
      const decimal = parts.pop();
      stringValue = parts.join('') + '.' + decimal;
    }
  }

  return stringValue;
}

function ProductListActions() {
  return (
    <TopToolbar>
      <Button
        component={Link}
        to="/products/bulk-import"
        label="Importar em massa"
      >
        <UploadFileIcon />
      </Button>

      <CreateButton />
    </TopToolbar>
  );
}

export function ProductList() {
  return (
    <List
      title="Produtos"
      filters={productFilters}
      actions={<ProductListActions />}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="idNome" label="Código de Barras" />
        <TextField source="name" label="Nome" />
        <TextField source="preco" label="Preço" />
        <TextField source="precoRiscado" label="Preço Riscado" />
        <BooleanField source="ativo" label="Ativo" />
        <TextField source="categoria" label="Categoria" />
        <TextField source="marca" label="Marca" />
        <TextField source="tags" label="Tags" />
        <TextField source="peso" label="Peso" />
        <TextField source="dimensoes" label="Dimensões" />
        <TextField source="materiais" label="Materiais" />
      </Datagrid>
    </List>
  );
}

export function ProductEdit() {
  const transform = async (data) => {
    const productId = data.id;

    let novasImagens = data.imagens;

    if (Array.isArray(data.imagens)) {
      const imagensExistentes = data.imagens
        .filter((img) => !img.rawFile)
        .map((img) =>
          typeof img === 'string'
            ? { src: img, url: img, path: null }
            : {
                src: img.src || img.url || '',
                url: img.url || img.src || '',
                path: img.path || null,
              }
        );

      const imagensNovas = data.imagens.filter((img) => img.rawFile);

      if (imagensNovas.length > 0) {
        const uploaded = await uploadMultipleImages(
          imagensNovas.map((img) => img.rawFile),
          `lojas/${data.storeId}/produtos/${productId}`
        );

        novasImagens = [
          ...imagensExistentes,
          ...uploaded.map((item) => ({
            src: item.url,
            url: item.url,
            path: item.path,
          })),
        ];
      } else {
        novasImagens = imagensExistentes;
      }
    }

    return {
      ...data,
      preco: normalizePrice(data.preco),
      precoRiscado: normalizePrice(data.precoRiscado),
      ativo: data.ativo ?? true,
      imagens: novasImagens,
    };
  };

  return (
    <Edit resource="products" title="Editar Produto" transform={transform}>
      <SimpleForm>
        <TextInput source="idNome" label="Código de barras" fullWidth />

        <TextInput
          source="name"
          label="Nome"
          fullWidth
          validate={[required('Nome é obrigatório')]}
        />

        <TextInput
          source="preco"
          label="Preço"
          fullWidth
          validate={[required('Preço é obrigatório')]}
        />

        <TextInput source="precoRiscado" label="Preço Riscado" fullWidth />

        <BooleanInput source="ativo" label="Produto ativo?" />

        <TextInput source="descricao" label="Descrição" multiline fullWidth />

        <ReferenceInput source="categoriaId" reference="categorias">
  <AutocompleteInput
    label="Categoria"
    optionText="name"
    fullWidth
    filterToQuery={(searchText) => ({
      q: searchText,
    })}
  />
</ReferenceInput>

<ReferenceInput source="marcaId" reference="marcas">
  <AutocompleteInput
    label="Marca"
    optionText="name"
    fullWidth
    filterToQuery={(searchText) => ({
      q: searchText,
    })}
  />
</ReferenceInput>

<ReferenceArrayInput source="tagIds" reference="tags">
  <AutocompleteArrayInput
    label="Tags"
    optionText="name"
    fullWidth
    filterToQuery={(searchText) => ({
      q: searchText,
    })}
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
        
      </SimpleForm>
    </Edit>
  );
}

export function ProductCreate() {
  

 

  const transform = async (data) => {
    const storeId = auth.currentUser.uid;
    const productId = data.idNome || crypto.randomUUID();

    let imagens = [];

    if (Array.isArray(data.imagens)) {
      const imagensExistentes = data.imagens
        .filter((img) => !img.rawFile)
        .map((img) =>
          typeof img === 'string'
            ? { src: img, url: img, path: null }
            : {
                src: img.src || img.url || '',
                url: img.url || img.src || '',
                path: img.path || null,
              }
        );

      const novasImagens = data.imagens.filter((img) => img.rawFile);

      if (novasImagens.length > 0) {
        const uploaded = await uploadMultipleImages(
          novasImagens.map((img) => img.rawFile),
          `lojas/${storeId}/produtos/${productId}`
        );

        imagens = [
          ...imagensExistentes,
          ...uploaded.map((item) => ({
            src: item.url,
            url: item.url,
            path: item.path,
          })),
        ];
      } else {
        imagens = imagensExistentes;
      }
    }

    return {
      ...data,
      idNome: data.idNome,
      preco: normalizePrice(data.preco),
      precoRiscado: normalizePrice(data.precoRiscado),
      ativo: data.ativo ?? true,
      imagens,
      storeId,
    };
  };

  return (
    <Create resource="products" title="Criar Produto" transform={transform}>
      <SimpleForm>
        

        <TextInput source="idNome" label="Código de Barras" fullWidth />

        <TextInput
          source="name"
          label="Nome"
          fullWidth
          validate={[required('Nome é obrigatório')]}
        />

        <TextInput
          source="preco"
          label="Preço"
          fullWidth
          validate={[required('Preço é obrigatório')]}
        />

        <TextInput source="precoRiscado" label="Preço Riscado" fullWidth />

        <BooleanInput
          source="ativo"
          label="Produto ativo?"
          defaultValue={true}
        />

        <TextInput source="descricao" label="Descrição" multiline fullWidth />

        <ReferenceInput source="categoriaId" reference="categorias">
          <AutocompleteInput label="Categoria" optionText="name" fullWidth />
        </ReferenceInput>

        <ReferenceInput source="marcaId" reference="marcas">
          <AutocompleteInput label="Marca" optionText="name" fullWidth />
        </ReferenceInput>

        <ReferenceArrayInput source="tagIds" reference="tags">
          <AutocompleteArrayInput label="Tags" optionText="name" fullWidth />
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
      </SimpleForm>
    </Create>
  );
}