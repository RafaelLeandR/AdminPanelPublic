import * as React from 'react';

import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';

import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

import {
  updatePassword,
} from 'firebase/auth';

import { auth } from './firebase';

export default function MinhaContaPage() {
  const [senha, setSenha] = React.useState('');
  const [confirmarSenha, setConfirmarSenha] =
    React.useState('');

  const [mostrarSenha, setMostrarSenha] =
    React.useState(false);

  const [loading, setLoading] =
    React.useState(false);

  const handleSalvar = async () => {
    if (!senha || !confirmarSenha) {
      alert('Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      alert(
        'A senha deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        alert('Usuário não autenticado.');
        return;
      }

      await updatePassword(user, senha);

      alert('Senha alterada com sucesso!');

      setSenha('');
      setConfirmarSenha('');

    } catch (error) {
      console.error(error);

      if (
        error.code ===
        'auth/requires-recent-login'
      ) {
        alert(
          'Faça login novamente antes de alterar a senha.'
        );
      } else {
        alert('Erro ao alterar senha.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        margin: '0 auto',
        p: 3,
      }}
    >
      <Card>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
          >
            Minha conta
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              label="Nova senha"
              type={
                mostrarSenha
                  ? 'text'
                  : 'password'
              }
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setMostrarSenha(
                          !mostrarSenha
                        )
                      }
                      edge="end"
                    >
                      {mostrarSenha ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirmar senha"
              type={
                mostrarSenha
                  ? 'text'
                  : 'password'
              }
              value={confirmarSenha}
              onChange={(e) =>
                setConfirmarSenha(
                  e.target.value
                )
              }
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setMostrarSenha(
                          !mostrarSenha
                        )
                      }
                      edge="end"
                    >
                      {mostrarSenha ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="button"
              variant="contained"
              onClick={handleSalvar}
              disabled={loading}
            >
              {loading
                ? 'Salvando...'
                : 'Alterar senha'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}