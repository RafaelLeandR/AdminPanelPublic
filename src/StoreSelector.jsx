import React from 'react';
import { Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useStoreSelector } from './StoreContext';

function StoreSelector() {
  const { stores, selectedStoreId, setSelectedStoreId } = useStoreSelector();

  if (!stores || stores.length === 0) return null;

  return (
    <Box sx={{ minWidth: 240, p: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="store-select-label">Loja</InputLabel>
        <Select
          labelId="store-select-label"
          value={selectedStoreId || ''}
          label="Loja"
          onChange={(e) => setSelectedStoreId(e.target.value)}
        >
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.nomeLoja}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default StoreSelector;