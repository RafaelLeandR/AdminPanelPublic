import React from 'react';
import { TextInput } from 'react-admin';

export const simpleSearchFilter = [
  <TextInput key="q" source="q" label="Pesquisar" alwaysOn />,
];

export const productFilters = [
  <TextInput key="q" source="q" label="Pesquisar" alwaysOn />,
  <TextInput key="categoria" source="categoria" label="Categoria" />,
  <TextInput key="marca" source="marca" label="Marca" />,
  <TextInput key="tag" source="tag" label="Tag" />,
];