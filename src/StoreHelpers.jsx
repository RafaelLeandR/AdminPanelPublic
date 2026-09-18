import React from 'react';
import {
  List,
  TopToolbar,
  CreateButton,
  Create,
  Edit,
  SimpleForm,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { useStoreSelector } from './StoreContext';
import StoreSelector from './StoreSelector';

export function ListActionsWithStoreSelector() {
  return (
    <TopToolbar>
      <CreateButton />
      <StoreSelector />
    </TopToolbar>
  );
}
import { useLocation } from 'react-router-dom';

export function ResetOnRoute({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname}>
      {children}
    </div>
  );
}
export function StoreRequiredMessage({ title = 'Selecione uma loja' }) {
  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Você precisa selecionar uma loja para continuar.
      </Typography>
      <StoreSelector />
    </Box>
  );
}

export function StoreFilteredList(props) {
  const { selectedStoreId } = useStoreSelector();

  return (
    <List
      {...props}
      filter={selectedStoreId ? { storeId: selectedStoreId } : {}}
      actions={<ListActionsWithStoreSelector />}
    >
      {props.children}
    </List>
  );
}

export function StoreCreateWrapper({ title, resource, children }) {
  const { selectedStoreId } = useStoreSelector();

  if (!selectedStoreId) {
    return <StoreRequiredMessage title="Selecione uma loja antes de criar" />;
  }

  const transform = async (data) => ({
    ...data,
    storeId: String(data.storeId || selectedStoreId),
  });

  return (
    <Create
    
      resource={resource}
      title={title}
      transform={transform}
    >
      <SimpleForm>{children}</SimpleForm>
    </Create>
  );
}

export function StoreEditWrapper({ title, resource, children }) {
  return (
    <Edit
    
      resource={resource}
      title={title}
    >
      <SimpleForm >{children}</SimpleForm>
    </Edit>
  );
}