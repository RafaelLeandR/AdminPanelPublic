import React, { useEffect, useState } from 'react';

import {
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  List,
} from 'react-admin';

import { Box, Typography } from '@mui/material';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db, auth } from './firebase';

export function SobreNosList() {
  return (
    <List
      resource="sobreNos"
      title="Sobre nós"
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="titulo" label="Título" />
        <TextField
          source="descricao"
          label="Descrição"
        />
      </Datagrid>
    </List>
  );
}

export function SobreNosEdit() {
  return (
    <Edit
      resource="sobreNos"
      title="Editar Sobre nós"
    >
      <SimpleForm>
        <TextInput
          source="titulo"
          label="Título"
          fullWidth
        />

        <TextInput
          source="descricao"
          label="Descrição"
          multiline
          fullWidth
        />
      </SimpleForm>
    </Edit>
  );
}

export function SobreNosCreate() {
  const [loadingCheck, setLoadingCheck] =
    useState(true);

  const [alreadyExists, setAlreadyExists] =
    useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoadingCheck(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'sobreNos'),
          where('storeId', '==', user.uid)
        );

        const snapshot = await getDocs(q);

        setAlreadyExists(!snapshot.empty);

      } catch (error) {
        console.error(error);

      } finally {
        setLoadingCheck(false);
      }
    };

    checkExisting();
  }, []);

  if (loadingCheck) {
    return (
      <Box p={3}>
        <Typography>
          Verificando Sobre nós...
        </Typography>
      </Box>
    );
  }

  if (alreadyExists) {
    return (
      <Box p={3}>
        <Typography variant="h6">
          Já existe um Sobre nós
        </Typography>
      </Box>
    );
  }

  const transform = async (data) => {
    const user = auth.currentUser;

    return {
      ...data,
      storeId: user.uid,
    };
  };

  return (
    <Create
      resource="sobreNos"
      title="Criar Sobre nós"
      transform={transform}
    >
      <SimpleForm>
        <TextInput
          source="titulo"
          label="Título"
          fullWidth
        />

        <TextInput
          source="descricao"
          label="Descrição"
          multiline
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
}