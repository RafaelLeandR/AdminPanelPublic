import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  useNotify,
  useRedirect,
} from 'react-admin';
import { CroppedImageInput, BannerCarouselInput } from './images';

import { simpleSearchFilter } from './filters';
import { uploadSingleImage, uploadMultipleImages } from './imageUpload';
import { Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';

function LojaUrlPreview() {
  const record = useRecordContext();

  if (!record) return null;

  return (
    <Typography sx={{ mb: 3 }}>
      <strong>Endereço da loja:</strong>
      <br />
      siteadmin.com.br/{record.id}
    </Typography>
  );
}

function normalizeSingleImage(image) {
  if (!image) return null;

  if (typeof image === 'string') {
    return {
      src: image,
      url: image,
      path: null,
    };
  }

  return {
    src: image.src || image.url || '',
    url: image.url || image.src || '',
    path: image.path || null,
  };
}

function normalizeCarouselImage(image) {
  if (!image) return null;

  if (typeof image === 'string') {
    return {
      src: image,
      url: image,
      path: null,
      link: '',
    };
  }

  return {
    src: image.src || image.url || '',
    url: image.url || image.src || '',
    path: image.path || null,
    link: image.link || '',
  };
}

export function PaginaInicialList() {
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
        <TextField source="facebook" label="Facebook" />
        <TextField source="instagram" label="Instagram" />
        <TextField source="youtube" label="YouTube" />
        <TextField source="textoCarrossel" label="Texto Carrossel" />
        <TextField
          source="textoBotaoCarrossel"
          label="Texto Botão Carrossel"
        />
        <TextField source="corDosBotoes" label="Cor dos Botões" />
        <EditButton type="button" />
      </Datagrid>
    </List>
  );
}

export function PaginaInicialCreate() {
  const notify = useNotify();
  const redirect = useRedirect();
  const reloadStores = async () => {};

  const transform = async (data) => {
    const lojaId = String(data.id || '')
  .trim()
  .toLowerCase();

    let novoIconeLoja = null;
    let novoIconeQuadrado = null;
    let novasImagensCarrossel = [];
    let novasImagensCarrosselLogos = [];

    if (data.iconeLoja?.rawFile) {
      const file = data.iconeLoja.rawFile;
      const extension = file.name.split('.').pop();
      const path = `lojas/${lojaId}/iconeLoja/icone.${extension}`;
      const uploaded = await uploadSingleImage(file, path);

      novoIconeLoja = {
        src: uploaded.url,
        url: uploaded.url,
        path: uploaded.path,
      };
    } else {
      novoIconeLoja = normalizeSingleImage(data.iconeLoja);
    }

    if (data.iconeQuadrado?.rawFile) {
      const file = data.iconeQuadrado.rawFile;
      const extension = file.name.split('.').pop();
      const path = `lojas/${lojaId}/iconeQuadrado/icone.${extension}`;
      const uploaded = await uploadSingleImage(file, path);

      novoIconeQuadrado = {
        src: uploaded.url,
        url: uploaded.url,
        path: uploaded.path,
      };
    } else {
      novoIconeQuadrado = normalizeSingleImage(data.iconeQuadrado);
    }

    if (Array.isArray(data.imagensCarrossel)) {
      const imagensExistentes = data.imagensCarrossel
        .filter((img) => !img.rawFile)
        .map(normalizeCarouselImage)
        .filter(Boolean);

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
            url: item.url,
            path: item.path,
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
        .map(normalizeSingleImage)
        .filter(Boolean);

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
          ...uploaded.map((item) => ({
            src: item.url,
            url: item.url,
            path: item.path,
          })),
        ];
      } else {
        novasImagensCarrosselLogos = imagensExistentes;
      }
    }

    const finalData = {
      ...data,
      id: String(data.id || '').trim().toLowerCase(),
      
      iconeLoja: novoIconeLoja,
      iconeQuadrado: novoIconeQuadrado,
      imagensCarrossel: novasImagensCarrossel,
      imagensCarrosselLogos: novasImagensCarrosselLogos,
      facebook: data.facebook || '',
      instagram: data.instagram || '',
      youtube: data.youtube || '',
      
    };

    console.log('PAGINA INICIAL CREATE - DADOS FINAIS:', finalData);

    return finalData;
  };

  const onSuccess = async () => {
    await reloadStores();
    notify('Loja criada com sucesso!');
    redirect('/paginaInicial');
  };

  const onError = (error) => {
    console.error('ERRO AO CRIAR PÁGINA INICIAL:', error);
    notify(error?.message || 'Erro ao criar loja', { type: 'error' });
  };

  return (
    <Create
      resource="paginaInicial"
      title="Criar Página Inicial"
      transform={transform}
      mutationOptions={{ onSuccess, onError }}
    >
      <SimpleForm>
        <Typography sx={{ mb: 2 }}>
  O endereço da sua loja será:
  <br />
  siteadmin.com.br/seu-slug
</Typography>
        <TextInput
  source="id"
  label="Slug da Loja"
  fullWidth
/>
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />
        <TextInput source="endereco" label="Endereço" fullWidth />
        

        <CroppedImageInput
          source="iconeLoja"
          label="Ícone da loja"
          type="logo"
        />

        <CroppedImageInput
          source="iconeQuadrado"
          label="Ícone quadrado"
          type="iconSquare"
        />

        <TextInput
          source="telefoneLigacoes"
          label="Telefone ligações (ddd e número)"
          fullWidth
        />
        <TextInput
          source="whatsapp"
          label="Whatsapp (ddd e número) (Será usado para receber as vendas)"
          fullWidth
        />

        <TextInput source="facebook" label="Facebook" fullWidth />
        <TextInput source="instagram" label="Instagram" fullWidth />
        <TextInput source="youtube" label="YouTube" fullWidth />

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

        <TextInput
          source="textoCarrossel"
          label="Texto Carrossel"
          fullWidth
        />

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
          label="Cor dos Botões"
          type="color"
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
}

export function PaginaInicialEdit() {
  const transform = async (data) => {
    const lojaId = String(data.id || '').trim();

    let novoIconeLoja = null;
    let novoIconeQuadrado = null;
    let novasImagensCarrossel = [];
    let novasImagensCarrosselLogos = [];

    if (data.iconeLoja?.rawFile) {
      const file = data.iconeLoja.rawFile;
      const extension = file.name.split('.').pop();
      const path = `lojas/${lojaId}/iconeLoja/icone.${extension}`;
      const uploaded = await uploadSingleImage(file, path);

      novoIconeLoja = {
        src: uploaded.url,
        url: uploaded.url,
        path: uploaded.path,
      };
    } else {
      novoIconeLoja = normalizeSingleImage(data.iconeLoja);
    }

    if (data.iconeQuadrado?.rawFile) {
      const file = data.iconeQuadrado.rawFile;
      const extension = file.name.split('.').pop();
      const path = `lojas/${lojaId}/iconeQuadrado/icone.${extension}`;
      const uploaded = await uploadSingleImage(file, path);

      novoIconeQuadrado = {
        src: uploaded.url,
        url: uploaded.url,
        path: uploaded.path,
      };
    } else {
      novoIconeQuadrado = normalizeSingleImage(data.iconeQuadrado);
    }

    if (Array.isArray(data.imagensCarrossel)) {
      const imagensExistentes = data.imagensCarrossel
        .filter((img) => !img.rawFile)
        .map(normalizeCarouselImage)
        .filter(Boolean);

      const imagensNovas = data.imagensCarrossel.filter((img) => img.rawFile);

      if (imagensNovas.length > 0) {
        const uploaded = await uploadMultipleImages(
          imagensNovas.map((img) => img.rawFile),
          `lojas/${lojaId}/carrossel`
        );

        novasImagensCarrossel = [
          ...imagensExistentes,
          ...uploaded.map((item, index) => ({
            src: item.url,
            url: item.url,
            path: item.path,
            link: imagensNovas[index]?.link || '',
          })),
        ];
      } else {
        novasImagensCarrossel = imagensExistentes;
      }
    }

    if (Array.isArray(data.imagensCarrosselLogos)) {
      const imagensExistentes = data.imagensCarrosselLogos
        .filter((img) => !img.rawFile)
        .map(normalizeSingleImage)
        .filter(Boolean);

      const imagensNovas = data.imagensCarrosselLogos.filter(
        (img) => img.rawFile
      );

      if (imagensNovas.length > 0) {
        const uploaded = await uploadMultipleImages(
          imagensNovas.map((img) => img.rawFile),
          `lojas/${lojaId}/carrosselLogos`
        );

        novasImagensCarrosselLogos = [
          ...imagensExistentes,
          ...uploaded.map((item) => ({
            src: item.url,
            url: item.url,
            path: item.path,
          })),
        ];
      } else {
        novasImagensCarrosselLogos = imagensExistentes;
      }
    }

    const finalData = {
      ...data,
      iconeLoja: novoIconeLoja,
      iconeQuadrado: novoIconeQuadrado,
      imagensCarrossel: novasImagensCarrossel,
      imagensCarrosselLogos: novasImagensCarrosselLogos,
      facebook: data.facebook || '',
      instagram: data.instagram || '',
      youtube: data.youtube || '',
     
    };

    console.log('PAGINA INICIAL EDIT - DADOS FINAIS:', finalData);

    return finalData;
  };

  return (
    <Edit
      resource="paginaInicial"
      title="Editar Página Inicial"
      transform={transform}
    >
      <SimpleForm>
        <LojaUrlPreview />
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />
        <TextInput source="endereco" label="Endereço" fullWidth />
        

        <CroppedImageInput
          source="iconeLoja"
          label="Ícone da loja"
          type="logo"
        />

        <CroppedImageInput
          source="iconeQuadrado"
          label="Ícone quadrado"
          type="iconSquare"
        />

        <TextInput
          source="telefoneLigacoes"
          label="Telefone ligações (ddd e número)"
          fullWidth
        />
        <TextInput
          source="whatsapp"
          label="Whatsapp (ddd e número) (Será usado para receber as vendas)"
          fullWidth
        />

        <TextInput source="facebook" label="Facebook" fullWidth />
        <TextInput source="instagram" label="Instagram" fullWidth />
        <TextInput source="youtube" label="YouTube" fullWidth />

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

        <TextInput
          source="textoCarrossel"
          label="Texto Carrossel"
          fullWidth
        />

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