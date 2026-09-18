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

function TagList() {
  return (
    <List
      resource="tags"
      title="Tags"
      filters={simpleSearchFilter}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" label="Nome" />
      </Datagrid>
    </List>
  );
}

function TagEdit() {
  return (
    <Edit resource="tags" title="Editar Tag">
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

function TagCreate() {
  return (
    <Create
      resource="tags"
      title="Criar Tag"
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

export { TagList, TagEdit, TagCreate };