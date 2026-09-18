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

export function BrandList() {
  return (
    <List
      resource="marcas"
      title="Marca"
      filters={simpleSearchFilter}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
      </Datagrid>
    </List>
  );
}

export function BrandEdit() {
  return (
    <Edit resource="marcas" title="Editar Marca">
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

export function BrandCreate() {
  return (
    <Create
      resource="marcas"
      title="Criar Marca"
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