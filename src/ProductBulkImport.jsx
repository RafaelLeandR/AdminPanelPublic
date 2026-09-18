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
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField as MuiTextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';





const createRowKey = () =>
  globalThis?.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createEmptyRow = () => ({
  __key: createRowKey(),
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

const parsePastedText = (text) => {
  const lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim() !== '');

  return lines.map((line) => {
    const cols = line.split('\t');

    return {
      __key: createRowKey(),
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

export default function ProductBulkImport() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();


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

 

  const updateRow = (rowKey, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.__key === rowKey ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeRow = (rowKey) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.__key !== rowKey);
      return next.length > 0 ? next : [createEmptyRow()];
    });
  };

  const clearAll = () => {
    setRows([createEmptyRow()]);
    setPasteText('');
  };

  const applyPastedText = (text) => {
    const parsedRows = parsePastedText(text).filter((row) => !isRowEmpty(row));

    if (parsedRows.length === 0) {
      notify('Nenhuma linha válida encontrada no texto colado', {
        type: 'warning',
      });
      return;
    }

    setRows(parsedRows);
    setPasteText('');
    notify(`${parsedRows.length} linha(s) carregada(s) com sucesso`, {
      type: 'success',
    });
  };

  const validateRows = () => {
    const errors = [];
    const barcodeMap = new Map();

    const filledRows = rows.filter((row) => !isRowEmpty(row));

    if (filledRows.length === 0) {
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
        const key = barcode;
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
          
        };

        let existingProduct = null;

        if (payloadBase.idNome) {
          const existingResult = await dataProvider.getList('products', {
            filter: {
              idNome: payloadBase.idNome,
             
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

  return (
    <Box sx={{ p: 2 }}>
      <Title title="Importação em Massa de Produtos" />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Importação em Massa de Produtos
        </Typography>

        <Stack spacing={2}>
          

          <Alert severity="info">
            Cole as colunas nesta ordem:
            <br />
            <strong>
              Código de Barras | Nome | Preço | Preço Riscado | Descrição | Peso
              | Dimensões | Materiais | Outras Informações
            </strong>
            <br />
            Categoria, marca e tags são escolhidas manualmente na planilha.
            Imagens não entram nesta importação.
          </Alert>

          <MuiTextField
            label="Cole aqui os dados do Excel / Google Sheets"
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

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<ContentPasteIcon />}
              onClick={() => applyPastedText(pasteText)}
              disabled={!getString(pasteText)}
            >
              Carregar texto colado
            </Button>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRow}
            >
              Adicionar linha
            </Button>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<ClearIcon />}
              onClick={clearAll}
            >
              Limpar tudo
            </Button>

            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || loadingOptions}
            >
              Salvar em massa
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 0, overflow: 'auto' }}>
        {loadingOptions ? (
          <Box
            sx={{
              minHeight: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Carregando categorias, marcas e tags...</Typography>
            </Stack>
          </Box>
        ) : (
          <Table size="small" sx={{ minWidth: 1800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 160 }}>Código de Barras</TableCell>
                <TableCell sx={{ minWidth: 220 }}>Nome *</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Preço *</TableCell>
                <TableCell sx={{ minWidth: 140 }}>Preço Riscado</TableCell>
                <TableCell sx={{ minWidth: 260 }}>Descrição</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Peso</TableCell>
                <TableCell sx={{ minWidth: 160 }}>Dimensões</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Materiais</TableCell>
                <TableCell sx={{ minWidth: 220 }}>Outras Informações</TableCell>
                <TableCell sx={{ minWidth: 220 }}>Categoria</TableCell>
                <TableCell sx={{ minWidth: 220 }}>Marca</TableCell>
                <TableCell sx={{ minWidth: 260 }}>Tags</TableCell>
                <TableCell sx={{ minWidth: 80 }}>Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => {
                const selectedCategoria =
                  categorias.find(
                    (item) => String(item.id) === String(row.categoriaId)
                  ) || null;

                const selectedMarca =
                  marcas.find(
                    (item) => String(item.id) === String(row.marcaId)
                  ) || null;

                const selectedTags = tags.filter((item) =>
                  (row.tagIds || []).map(String).includes(String(item.id))
                );

                return (
                  <TableRow key={row.__key}>
                    <TableCell>
                      <MuiTextField
                        size="small"
                        value={row.idNome}
                        onChange={(e) =>
                          updateRow(row.__key, 'idNome', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        required
                        value={row.name}
                        onChange={(e) =>
                          updateRow(row.__key, 'name', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        required
                        value={row.preco}
                        onChange={(e) =>
                          updateRow(row.__key, 'preco', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        value={row.precoRiscado}
                        onChange={(e) =>
                          updateRow(row.__key, 'precoRiscado', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        value={row.descricao}
                        onChange={(e) =>
                          updateRow(row.__key, 'descricao', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        value={row.peso}
                        onChange={(e) =>
                          updateRow(row.__key, 'peso', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        value={row.dimensoes}
                        onChange={(e) =>
                          updateRow(row.__key, 'dimensoes', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        value={row.materiais}
                        onChange={(e) =>
                          updateRow(row.__key, 'materiais', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <MuiTextField
                        size="small"
                        value={row.outrasInformacoes}
                        onChange={(e) =>
                          updateRow(
                            row.__key,
                            'outrasInformacoes',
                            e.target.value
                          )
                        }
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={categorias}
                        value={selectedCategoria}
                        isOptionEqualToValue={(option, value) =>
                          String(option.id) === String(value.id)
                        }
                        getOptionLabel={(option) => option?.name || ''}
                        onChange={(_, value) =>
                          updateRow(
                            row.__key,
                            'categoriaId',
                            value ? value.id : ''
                          )
                        }
                        renderInput={(params) => (
                          <MuiTextField {...params} fullWidth />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={marcas}
                        value={selectedMarca}
                        isOptionEqualToValue={(option, value) =>
                          String(option.id) === String(value.id)
                        }
                        getOptionLabel={(option) => option?.name || ''}
                        onChange={(_, value) =>
                          updateRow(row.__key, 'marcaId', value ? value.id : '')
                        }
                        renderInput={(params) => (
                          <MuiTextField {...params} fullWidth />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Autocomplete
                        multiple
                        size="small"
                        options={tags}
                        value={selectedTags}
                        isOptionEqualToValue={(option, value) =>
                          String(option.id) === String(value.id)
                        }
                        getOptionLabel={(option) => option?.name || ''}
                        onChange={(_, value) =>
                          updateRow(
                            row.__key,
                            'tagIds',
                            value.map((item) => item.id)
                          )
                        }
                        renderInput={(params) => (
                          <MuiTextField {...params} fullWidth />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => removeRow(row.__key)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}