import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
} from 'react-admin';

export function StoreList() {
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

export function StoreEdit() {
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