import React from 'react';

import {
  Datagrid,
  TextField,
  TextInput,
  Edit,
  Create,
  SimpleForm,
  List,
} from 'react-admin';

import { simpleSearchFilter } from './filters';

export function CategoryList() {
  return (
    <List
      resource="categorias"
      title="Categorias"
      filters={simpleSearchFilter}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
      </Datagrid>
    </List>
  );
}

export function CategoryEdit() {
  return (
    <Edit resource="categorias" title="Editar Categoria">
      <SimpleForm>
        <TextInput
          source="name"
          label="Nome"
          fullWidth
        />
      </SimpleForm>
    </Edit>
  );
}

export function CategoryCreate() {
  return (
    <Create
      resource="categorias"
      title="Criar Categoria"
    >
      <SimpleForm>
        <TextInput
          source="name"
          label="Nome"
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
}