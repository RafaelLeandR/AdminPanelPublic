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
import { useStoreSelector } from './StoreContext';
import { simpleSearchFilter } from './filters';

export function PaginaInicialList() {
  return (
    <List title="Página Inicial - Lojas" filters={simpleSearchFilter}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="nomeLoja" label="Nome da Loja" />
        <TextField source="email" label="E-mail" />
        <TextField source="telefone" label="Telefone" />
        <TextField source="endereco" label="Endereço" />
        <TextField source="latitude" label="Latitude" />
        <TextField source="longitude" label="Longitude" />
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
  const { reloadStores } = useStoreSelector();

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
      mutationOptions={{ onSuccess, onError }}
    >
      <SimpleForm>
        <TextInput source="id" label="ID da Loja" fullWidth />
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />

        <TextInput source="endereco" label="Endereço" fullWidth />
        <TextInput source="latitude" label="Latitude" fullWidth />
        <TextInput source="longitude" label="Longitude" fullWidth />

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
  const notify = useNotify();
  const { reloadStores } = useStoreSelector();

  const onSuccess = async () => {
    await reloadStores();
    notify('Loja atualizada com sucesso!');
  };

  const onError = (error) => {
    console.error('ERRO AO ATUALIZAR PÁGINA INICIAL:', error);
    notify(error?.message || 'Erro ao atualizar loja', { type: 'error' });
  };

  return (
    <Edit
      resource="paginaInicial"
      title="Editar Página Inicial"
      mutationOptions={{ onSuccess, onError }}
    >
      <SimpleForm>
        <TextInput source="id" label="ID da Loja" fullWidth disabled />
        <TextInput source="nomeLoja" label="Nome da Loja" fullWidth />
        <TextInput source="email" label="E-mail" fullWidth />
        <TextInput source="telefone" label="Telefone" fullWidth />

        <TextInput source="endereco" label="Endereço" fullWidth />
        <TextInput source="latitude" label="Latitude" fullWidth />
        <TextInput source="longitude" label="Longitude" fullWidth />

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