import * as React from 'react';
import {
  Title,
  useDataProvider,
  useNotify,
  useRefresh,
} from 'react-admin';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

import { useStoreSelector } from './StoreContext';
import StoreSelector from './StoreSelector';
import { StoreRequiredMessage } from './StoreHelpers';

const createRowId = () =>
  globalThis?.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createEmptyRow = () => ({
  id: createRowId(),
  idNome: '',
  name: '',
  preco: '',
  precoRiscado: '',
  descricao: '',
  peso: '',
  dimensoes: '',
  materiais: '',
  outrasInformacoes: '',
  categoriaId: '',
  marcaId: '',
  tagIds: [],
});

const getString = (value) => String(value ?? '').trim();

const normalizeMoney = (value) => {
  const raw = getString(value);
  if (!raw) return '';

  if (raw.includes(',') && raw.includes('.')) {
    return raw.replace(/\./g, '').replace(',', '.');
  }

  if (raw.includes(',')) {
    return raw.replace(',', '.');
  }

  return raw;
};

const isRowEmpty = (row) => {
  return (
    !getString(row.idNome) &&
    !getString(row.name) &&
    !getString(row.preco) &&
    !getString(row.precoRiscado) &&
    !getString(row.descricao) &&
    !getString(row.peso) &&
    !getString(row.dimensoes) &&
    !getString(row.materiais) &&
    !getString(row.outrasInformacoes) &&
    !getString(row.categoriaId) &&
    !getString(row.marcaId) &&
    (!Array.isArray(row.tagIds) || row.tagIds.length === 0)
  );
};

const parsePastedText = (text) => {
  const lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim() !== '');

  return lines.map((line) => {
    const cols = line.split('\t');

    return {
      id: createRowId(),
      idNome: cols[0] || '',
      name: cols[1] || '',
      preco: cols[2] || '',
      precoRiscado: cols[3] || '',
      descricao: cols[4] || '',
      peso: cols[5] || '',
      dimensoes: cols[6] || '',
      materiais: cols[7] || '',
      outrasInformacoes: cols[8] || '',
      categoriaId: '',
      marcaId: '',
      tagIds: [],
    };
  });
};

function TagsEditCell(props) {
  const { id, field, value, api, options } = props;

  const selectedValues = Array.isArray(value) ? value.map(String) : [];

  const selectedOptions = options.filter((item) =>
    selectedValues.includes(String(item.id))
  );

  return (
    <Autocomplete
      multiple
      size="small"
      fullWidth
      options={options}
      value={selectedOptions}
      disableCloseOnSelect
      getOptionLabel={(option) => option?.name || ''}
      isOptionEqualToValue={(option, val) =>
        String(option.id) === String(val.id)
      }
      onChange={(_, newValue) => {
        api.setEditCellValue({
          id,
          field,
          value: newValue.map((item) => item.id),
        });
      }}
      onBlur={() => {
        api.stopCellEditMode({ id, field });
      }}
      renderInput={(params) => (
        <TextField {...params} autoFocus variant="standard" />
      )}
      sx={{ minWidth: 240, py: 0.5 }}
    />
  );
}

function SpreadsheetToolbar({
  onAddRow,
  onClearAll,
  onLoadPaste,
  onSave,
  saving,
  loadingOptions,
  pasteText,
}) {
  return (
    <GridToolbarContainer
      sx={{
        p: 1.5,
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fafafa',
      }}
    >
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAddRow}
      >
        Adicionar linha
      </Button>

      <Button
        variant="outlined"
        startIcon={<ContentPasteIcon />}
        onClick={onLoadPaste}
        disabled={!getString(pasteText)}
      >
        Carregar texto colado
      </Button>

      <Button
        variant="outlined"
        color="warning"
        startIcon={<ClearIcon />}
        onClick={onClearAll}
      >
        Limpar tudo
      </Button>

      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
        onClick={onSave}
        disabled={saving || loadingOptions}
      >
        Salvar em massa
      </Button>
    </GridToolbarContainer>
  );
}

export default function ProductBulkImport() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const { selectedStoreId } = useStoreSelector();

  const [rows, setRows] = React.useState([createEmptyRow()]);
  const [pasteText, setPasteText] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [loadingOptions, setLoadingOptions] = React.useState(true);

  const [categorias, setCategorias] = React.useState([]);
  const [marcas, setMarcas] = React.useState([]);
  const [tags, setTags] = React.useState([]);

  React.useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setLoadingOptions(true);

      try {
        const [categoriasRes, marcasRes, tagsRes] = await Promise.all([
          dataProvider.getList('categorias', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'name', order: 'ASC' },
          }),
          dataProvider.getList('marcas', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'name', order: 'ASC' },
          }),
          dataProvider.getList('tags', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'name', order: 'ASC' },
          }),
        ]);

        if (!active) return;

        setCategorias(categoriasRes.data || []);
        setMarcas(marcasRes.data || []);
        setTags(tagsRes.data || []);
      } catch (error) {
        console.error(error);
        notify('Erro ao carregar categorias, marcas e tags', {
          type: 'error',
        });
      } finally {
        if (active) setLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, [dataProvider, notify]);

  if (!selectedStoreId) {
    return (
      <StoreRequiredMessage title="Selecione uma loja antes de importar produtos" />
    );
  }

  const categoriaLabel = (id) =>
    categorias.find((item) => String(item.id) === String(id))?.name || '';

  const marcaLabel = (id) =>
    marcas.find((item) => String(item.id) === String(id))?.name || '';

  const tagLabels = (ids = []) =>
    tags.filter((item) => ids.map(String).includes(String(item.id)));

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeRow = (rowId) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== rowId);
      return next.length ? next : [createEmptyRow()];
    });
  };

  const clearAll = () => {
    setRows([createEmptyRow()]);
    setPasteText('');
  };

  const applyPastedText = (text) => {
    const parsedRows = parsePastedText(text).filter((row) => !isRowEmpty(row));

    if (!parsedRows.length) {
      notify('Nenhuma linha válida encontrada no texto colado', {
        type: 'warning',
      });
      return;
    }

    setRows((prev) => {
      const nonEmptyRows = prev.filter((row) => !isRowEmpty(row));
      if (!nonEmptyRows.length) return parsedRows;
      return [...nonEmptyRows, ...parsedRows];
    });

    setPasteText('');
    notify(`${parsedRows.length} linha(s) adicionada(s)`, {
      type: 'success',
    });
  };

  const validateRows = () => {
    const errors = [];
    const filledRows = rows.filter((row) => !isRowEmpty(row));
    const barcodeMap = new Map();

    if (!filledRows.length) {
      errors.push('Adicione pelo menos uma linha com dados');
      return errors;
    }

    filledRows.forEach((row, index) => {
      const line = index + 1;

      if (!getString(row.name)) {
        errors.push(`Linha ${line}: nome é obrigatório`);
      }

      if (!getString(row.preco)) {
        errors.push(`Linha ${line}: preço é obrigatório`);
      }

      const barcode = getString(row.idNome);
      if (barcode) {
        const key = `${selectedStoreId}::${barcode}`;
        const count = barcodeMap.get(key) || 0;
        barcodeMap.set(key, count + 1);
      }
    });

    for (const [key, count] of barcodeMap.entries()) {
      if (count > 1) {
        const barcode = key.split('::')[1];
        errors.push(
          `Código de barras duplicado na planilha para esta loja: ${barcode}`
        );
      }
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateRows();

    if (errors.length > 0) {
      notify(errors[0], { type: 'warning' });
      return;
    }

    const filledRows = rows.filter((row) => !isRowEmpty(row));

    setSaving(true);

    try {
      let createdCount = 0;
      let updatedCount = 0;

      for (const row of filledRows) {
        const payloadBase = {
          idNome: getString(row.idNome),
          name: getString(row.name),
          preco: normalizeMoney(row.preco),
          precoRiscado: normalizeMoney(row.precoRiscado),
          descricao: getString(row.descricao),
          peso: getString(row.peso),
          dimensoes: getString(row.dimensoes),
          materiais: getString(row.materiais),
          outrasInformacoes: getString(row.outrasInformacoes),
          categoriaId: getString(row.categoriaId) || null,
          marcaId: getString(row.marcaId) || null,
          tagIds: Array.isArray(row.tagIds) ? row.tagIds : [],
          storeId: String(selectedStoreId),
        };

        let existingProduct = null;

        if (payloadBase.idNome) {
          const existingResult = await dataProvider.getList('products', {
            filter: {
              idNome: payloadBase.idNome,
              storeId: String(selectedStoreId),
            },
            pagination: { page: 1, perPage: 1 },
            sort: { field: 'id', order: 'ASC' },
          });

          existingProduct = existingResult?.data?.[0] || null;
        }

        if (existingProduct) {
          await dataProvider.update('products', {
            id: existingProduct.id,
            data: {
              ...existingProduct,
              ...payloadBase,
              imagens: existingProduct.imagens || [],
            },
            previousData: existingProduct,
          });

          updatedCount += 1;
        } else {
          await dataProvider.create('products', {
            data: {
              ...payloadBase,
              imagens: [],
            },
          });

          createdCount += 1;
        }
      }

      notify(
        `Importação concluída. Criados: ${createdCount}. Atualizados: ${updatedCount}.`,
        { type: 'success' }
      );

      setRows([createEmptyRow()]);
      setPasteText('');
      refresh();
    } catch (error) {
      console.error(error);
      notify('Erro ao salvar produtos em massa', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        field: 'idNome',
        headerName: 'Código de Barras',
        minWidth: 180,
        flex: 1,
        editable: true,
      },
      {
        field: 'name',
        headerName: 'Nome *',
        minWidth: 220,
        flex: 1.2,
        editable: true,
      },
      {
        field: 'preco',
        headerName: 'Preço *',
        minWidth: 120,
        flex: 0.8,
        editable: true,
      },
      {
        field: 'precoRiscado',
        headerName: 'Preço Riscado',
        minWidth: 140,
        flex: 0.9,
        editable: true,
      },
      {
        field: 'descricao',
        headerName: 'Descrição',
        minWidth: 240,
        flex: 1.4,
        editable: true,
      },
      {
        field: 'peso',
        headerName: 'Peso',
        minWidth: 120,
        flex: 0.8,
        editable: true,
      },
      {
        field: 'dimensoes',
        headerName: 'Dimensões',
        minWidth: 160,
        flex: 1,
        editable: true,
      },
      {
        field: 'materiais',
        headerName: 'Materiais',
        minWidth: 180,
        flex: 1,
        editable: true,
      },
      {
        field: 'outrasInformacoes',
        headerName: 'Outras Informações',
        minWidth: 220,
        flex: 1.2,
        editable: true,
      },
      {
        field: 'categoriaId',
        headerName: 'Categoria',
        minWidth: 220,
        flex: 1,
        editable: true,
        type: 'singleSelect',
        valueOptions: categorias.map((item) => ({
          value: item.id,
          label: item.name,
        })),
        renderCell: (params) => categoriaLabel(params.value),
      },
      {
        field: 'marcaId',
        headerName: 'Marca',
        minWidth: 220,
        flex: 1,
        editable: true,
        type: 'singleSelect',
        valueOptions: marcas.map((item) => ({
          value: item.id,
          label: item.name,
        })),
        renderCell: (params) => marcaLabel(params.value),
      },
      {
        field: 'tagIds',
        headerName: 'Tags',
        minWidth: 260,
        flex: 1.3,
        editable: true,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const selected = tagLabels(params.value || []);

          return (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
                py: 0.5,
              }}
            >
              {selected.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          );
        },
        renderEditCell: (params) => (
          <TagsEditCell {...params} options={tags} />
        ),
      },
      {
        field: 'actions',
        headerName: '',
        minWidth: 70,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <IconButton
            color="error"
            onClick={() => removeRow(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        ),
      },
    ],
    [categorias, marcas, tags]
  );

  return (
    <Box sx={{ p: 2 }}>
      <Title title="Importação em Massa de Produtos" />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Importação em Massa de Produtos
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ maxWidth: 420 }}>
            <StoreSelector />
          </Box>

          <Alert severity="info">
            Campos obrigatórios: <strong>Nome</strong> e <strong>Preço</strong>.
            <br />
            O <strong>ID da Loja</strong> vem do seletor acima.
            <br />
            Se já existir produto com o mesmo <strong>código de barras</strong> e a mesma <strong>loja</strong>, ele será atualizado.
            <br />
            <strong>Categoria</strong>, <strong>Marca</strong> e <strong>Tags</strong> são escolhidas na grade.
            <br />
            <strong>Imagens não entram</strong> nesta importação.
          </Alert>

          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Cole dados do Excel/Google Sheets nesta ordem:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Código de Barras | Nome | Preço | Preço Riscado | Descrição | Peso | Dimensões | Materiais | Outras Informações
            </Typography>

            <TextField
              label="Área para colar linhas da planilha"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              multiline
              minRows={4}
              fullWidth
              placeholder={`7891234567890\tProduto Exemplo\t19,90\t29,90\tDescrição\t500g\t10x20x30\tPlástico\tObservação`}
              onPaste={(e) => {
                const text = e.clipboardData?.getData('text');
                if (text && (text.includes('\t') || text.includes('\n'))) {
                  e.preventDefault();
                  applyPastedText(text);
                }
              }}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper
        sx={{
          height: 700,
          overflow: 'hidden',
          '& .MuiDataGrid-cell': {
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8f9fa',
          },
        }}
      >
        {loadingOptions ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={22} />
              <Typography>Carregando categorias, marcas e tags...</Typography>
            </Stack>
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            editMode="cell"
            disableRowSelectionOnClick
            pagination
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25, page: 0 },
              },
            }}
            getRowHeight={() => 'auto'}
            processRowUpdate={(newRow) => newRow}
            onProcessRowUpdateError={(error) => {
              console.error(error);
              notify('Erro ao editar célula', { type: 'error' });
            }}
            slots={{
              toolbar: SpreadsheetToolbar,
            }}
            slotProps={{
              toolbar: {
                onAddRow: addRow,
                onClearAll: clearAll,
                onLoadPaste: () => applyPastedText(pasteText),
                onSave: handleSave,
                saving,
                loadingOptions,
                pasteText,
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
}