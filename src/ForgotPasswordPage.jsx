import { useState } from 'react';

import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from './firebase';

import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      alert('Digite seu e-mail.');
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      alert('E-mail de recuperação enviado.');

    } catch (error) {
      console.error(error);

      if (error.code === 'auth/user-not-found') {
        alert('Usuário não encontrado.');
      } else if (error.code === 'auth/invalid-email') {
        alert('E-mail inválido.');
      } else {
        alert('Erro ao enviar recuperação.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
      }}
    >
      <h2>Recuperar senha</h2>

      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: 300 }}
      />

      <br />

      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        style={{
          cursor: 'pointer',
        }}
      >
        {loading
          ? 'Enviando...'
          : 'Enviar recuperação'}
      </button>

      <div style={{ marginTop: 16 }}>
        <Link to="/">
          Voltar para login
        </Link>
      </div>
    </div>
  );
}