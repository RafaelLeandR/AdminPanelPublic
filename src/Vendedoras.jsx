import React, { useEffect, useState } from "react";

import {
  List,
  Datagrid,
  TextField,
  CreateButton,
  TopToolbar,
  Button,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  useDataProvider,
  useNotify,
  useParams,
  useRedirect,
  required,
} from "react-admin";

import {
  Card,
  CardContent,
  Typography,
  Button as MuiButton,
} from "@mui/material";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Link } from "react-router-dom";

import { uploadMultipleImages } from "./imageUpload";

// =====================================================
// FUNÇÃO PARA PEGAR A PÁGINA INICIAL DA LOJA
// =====================================================

async function getPaginaInicial(dataProvider) {
  const result = await dataProvider.getList("paginaInicial", {
    pagination: {
      page: 1,
      perPage: 100,
    },
    sort: {
      field: "id",
      order: "ASC",
    },
    filter: {},
  });

  if (!result.data || result.data.length === 0) {
    throw new Error(
      "Página inicial da loja não encontrada."
    );
  }

  return result.data[0];
}


// =====================================================
// TOOLBAR DA LISTA
// =====================================================

function VendedoraListActions() {
  return (
    <TopToolbar>
      <CreateButton label="Nova Vendedora" />
    </TopToolbar>
  );
}


// =====================================================
// LISTA
// =====================================================

export function VendedoraList() {
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [funcionarios, setFuncionarios] = useState([]);
  const [pagina, setPagina] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      setLoading(true);

      const result = await dataProvider.getList("paginaInicial", {
        pagination: {
          page: 1,
          perPage: 100,
        },
        sort: {
          field: "id",
          order: "ASC",
        },
        filter: {},
      });

      if (!result.data || result.data.length === 0) {
        setFuncionarios([]);
        setPagina(null);
        return;
      }

      const paginaAtual = result.data[0];

      setPagina(paginaAtual);

      const lista = Array.isArray(paginaAtual.funcionarios)
        ? paginaAtual.funcionarios
        : [];

      setFuncionarios(
        lista.map((funcionario, index) => ({
          id: index,
          ...funcionario,
        }))
      );

    } catch (error) {
      console.error(error);

      notify(
        error.message || "Erro ao carregar vendedoras",
        {
          type: "error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ padding: 24 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >

        <h2>
          Vendedoras
        </h2>

        <Button
          component={Link}
          to="/vendedoras/create"
          label="Nova Vendedora"
        >
          <AddPhotoAlternateIcon />
        </Button>

      </div>

      {loading ? (
        <div>
          Carregando vendedoras...
        </div>
      ) : funcionarios.length === 0 ? (
        <div>
          Nenhuma vendedora cadastrada.
        </div>
      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 24,
          }}
        >

          {funcionarios.map((funcionario) => (

            <Card key={funcionario.id}>

              {funcionario.foto && (
                <img
                  src={funcionario.foto}
                  alt={funcionario.nome}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                  }}
                />
              )}

              <CardContent>

                <Typography
                  variant="h6"
                  gutterBottom
                >
                  {funcionario.nome}
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  {funcionario.cargo || "Vendedora"}
                </Typography>

                {funcionario.whatsapp && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1 }}
                  >
                    WhatsApp: {funcionario.whatsapp}
                  </Typography>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 15,
                  }}
                >

                  <Button
                    component={Link}
                    to={`/vendedoras/${funcionario.id}`}
                    label="Editar"
                  >
                    <EditIcon />
                  </Button>

                  <Button
                    label="Excluir"
                    onClick={async () => {

                      const confirmar =
                        window.confirm(
                          `Deseja excluir ${funcionario.nome}?`
                        );

                      if (!confirmar) return;

                      try {

                        const novosFuncionarios =
                          funcionarios
                            .filter(
                              (item) =>
                                item.id !==
                                funcionario.id
                            )
                            .map(
                              ({
                                id,
                                ...item
                              }) => item
                            );

                        await dataProvider.update(
                          "paginaInicial",
                          {
                            id: pagina.id,

                            data: {
                              funcionarios:
                                novosFuncionarios,
                            },

                            previousData: pagina,
                          }
                        );

                        notify(
                          "Vendedora excluída com sucesso!",
                          {
                            type: "success",
                          }
                        );

                        carregar();

                      } catch (error) {

                        console.error(error);

                        notify(
                          "Erro ao excluir vendedora",
                          {
                            type: "error",
                          }
                        );

                      }

                    }}
                  >
                    <DeleteIcon />
                  </Button>

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}


// =====================================================
// COMPONENTE DE UPLOAD DE FOTO
// =====================================================

function FotoInput({
  foto,
  fotoFile,
  setFotoFile,
}) {
  return (
    <div style={{ marginTop: 20 }}>

      <MuiButton
        variant="outlined"
        component="label"
        startIcon={<AddPhotoAlternateIcon />}
      >
        {fotoFile
          ? fotoFile.name
          : "Selecionar foto"}

        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              setFotoFile(file);
            }
          }}
        />
      </MuiButton>

      {fotoFile && (
        <div style={{ marginTop: 15 }}>
          <img
            src={URL.createObjectURL(fotoFile)}
            alt="Preview"
            style={{
              width: 150,
              height: 150,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </div>
      )}

      {!fotoFile && foto && (
        <div style={{ marginTop: 15 }}>
          <img
            src={foto}
            alt="Vendedora"
            style={{
              width: 150,
              height: 150,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </div>
      )}

    </div>
  );
}


// =====================================================
// CRIAR
// =====================================================

// =====================================================
// CRIAR (CORRIGIDO)
// =====================================================



export function VendedoraCreate() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const [fotoFile, setFotoFile] = useState(null);

  const handleSave = async (values) => {
    try {
      const pagina = await getPaginaInicial(dataProvider);
      let fotoUrl = "";

      if (fotoFile) {
        const uploaded = await uploadMultipleImages(
          [fotoFile],
          `lojas/${pagina.storeId}/funcionarios`
        );
        if (uploaded.length > 0) fotoUrl = uploaded[0].url;
      }

      const novaVendedora = {
        nome: values.nome || "",
        cargo: values.cargo || "Vendedora",
        whatsapp: values.whatsapp || "",
        foto: fotoUrl,
      };

      const funcionariosAtuais = Array.isArray(pagina?.funcionarios)
        ? pagina.funcionarios
        : [];

      await dataProvider.update("paginaInicial", {
        id: pagina.id,
        data: { funcionarios: [...funcionariosAtuais, novaVendedora] },
        previousData: pagina,
      });

      notify("Vendedora cadastrada com sucesso!", { type: "success" });
      redirect("/vendedoras");
    } catch (error) {
      notify(error.message || "Erro ao salvar vendedora", { type: "error" });
    }
  };

  return (
    <Create title="Cadastrar Vendedora">
      <SimpleForm onSubmit={handleSave}>
        <TextInput source="nome" label="Nome" validate={[required()]} fullWidth />
        <TextInput source="cargo" label="Cargo" defaultValue="Vendedora" fullWidth />
        <TextInput source="whatsapp" label="WhatsApp" fullWidth />
        <FotoInput foto="" fotoFile={fotoFile} setFotoFile={setFotoFile} />
      </SimpleForm>
    </Create>
  );
}


// =====================================================
// EDITAR
// =====================================================

export function VendedoraEdit() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  const { id } = useParams();

  const [pagina, setPagina] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================================
  // CARREGAR
  // ===============================================

  useEffect(() => {
    const carregar = async () => {
      try {
        const paginaAtual =
          await getPaginaInicial(dataProvider);

        const funcionarios =
          Array.isArray(paginaAtual.funcionarios)
            ? paginaAtual.funcionarios
            : [];

        const index = Number(id);

        if (
          Number.isNaN(index) ||
          !funcionarios[index]
        ) {
          throw new Error(
            "Vendedora não encontrada."
          );
        }

        setPagina(paginaAtual);
        setFuncionario({
          ...funcionarios[index],
          id: index,
        });
      } catch (error) {
        console.error(error);

        notify(
          error.message ||
            "Erro ao carregar vendedora",
          {
            type: "error",
          }
        );
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [id]);

  // ===============================================
  // TRANSFORM
  // ===============================================

  const transform = async (data) => {
    if (!pagina || !funcionario) {
      return data;
    }

    let foto = data.foto || "";

    // =============================================
    // NOVA FOTO
    // =============================================

    if (fotoFile) {
      const uploaded = await uploadMultipleImages(
        [fotoFile],
        `lojas/${pagina.storeId}/funcionarios`
      );

      if (uploaded.length > 0) {
        foto = uploaded[0].url;
      }
    }

    const funcionarioAtualizado = {
      nome: data.nome,
      cargo: data.cargo || "Vendedora",
      whatsapp: data.whatsapp || "",
      foto,
    };

    const funcionarios = [
      ...(pagina.funcionarios || []),
    ];

    funcionarios[Number(id)] =
      funcionarioAtualizado;

    await dataProvider.update("paginaInicial", {
      id: pagina.id,

      data: {
        funcionarios,
      },

      previousData: pagina,
    });

    notify(
      "Vendedora atualizada com sucesso!",
      {
        type: "success",
      }
    );

    return {
      id,
      ...funcionarioAtualizado,
    };
  };

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Carregando...
      </div>
    );
  }

  if (!funcionario) {
    return (
      <div style={{ padding: 30 }}>
        Vendedora não encontrada.
      </div>
    );
  }

  return (
    <Edit
      resource="vendedoras"
      id={id}
      title="Editar Vendedora"
      transform={transform}
      mutationMode="pessimistic"
      redirect="list"
      record={funcionario}
    >
      <SimpleForm>

        <TextInput
          source="nome"
          label="Nome"
          fullWidth
          validate={[
            required("Nome é obrigatório"),
          ]}
        />

        <TextInput
          source="cargo"
          label="Cargo"
          fullWidth
        />

        <TextInput
          source="whatsapp"
          label="WhatsApp"
          fullWidth
        />

        <FotoInput
          foto={funcionario.foto}
          fotoFile={fotoFile}
          setFotoFile={setFotoFile}
        />

      </SimpleForm>
    </Edit>
  );
}