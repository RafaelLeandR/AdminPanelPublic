import * as React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Divider,
} from '@mui/material';

const lojasMock = [
  { id: 1, slug: 'minha-loja', nomeLoja: 'Minha Loja' },
  { id: 2, slug: 'minha-loja-2', nomeLoja: 'Minha Loja 2' },
];

export default function MinhaContaPage() {
  const [email, setEmail] = React.useState('usuario@email.com');
  const [senha, setSenha] = React.useState('');
  const [plano, setPlano] = React.useState('basic');
  const [lojas, setLojas] = React.useState(lojasMock);

  const baseUrl = 'https://meusite.com/loja';

  const handleSlugChange = (index, value) => {
    const updated = [...lojas];
    updated[index].slug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setLojas(updated);
  };

  const handleSalvar = () => {
    console.log({
      email,
      senha,
      plano,
      lojas,
    });

    alert('Dados salvos com sucesso!');
  };

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Minha conta
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Alterar e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <TextField
              label="Alterar senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Plano"
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              fullWidth
            >
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="plus">Plus</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
            </TextField>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom>
            Lojas cadastradas
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {lojas.map((loja, index) => (
              <Box
                key={loja.id}
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography variant="subtitle1">
                  ID da loja: {loja.id}
                </Typography>

                <TextField
                  label="Nome que aparece no link"
                  value={loja.slug}
                  onChange={(e) => handleSlugChange(index, e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                />

                <Typography sx={{ mt: 2 }}>
                  <strong>Link completo:</strong> {baseUrl}/{loja.slug}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            sx={{ mt: 4 }}
            onClick={handleSalvar}
          >
            Salvar alterações
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}