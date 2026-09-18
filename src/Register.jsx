import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [nomeLoja, setNomeLoja] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [endereco, setEndereco] = useState('');
 
 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (
      !nomeResponsavel ||
      !nomeLoja ||
      !email ||
      !whatsapp ||
      !endereco ||
      
      
      !password ||
      !confirmPassword
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Salva os dados da loja/cliente usando o UID do usuário
      await setDoc(doc(db, 'clientes', user.uid), {
  uid: user.uid,
  nomeResponsavel,
  nomeLoja,
  email,
  whatsapp,
  endereco,
  createdAt: new Date()
});

      alert('Conta criada com sucesso!');

      // Redireciona para painel
      navigate('/dashboard');

    } catch (error) {
      console.error(error);

      if (error.code === 'auth/email-already-in-use') {
        alert('Esse e-mail já está em uso.');
      } else if (error.code === 'auth/invalid-email') {
        alert('E-mail inválido.');
      } else if (error.code === 'auth/weak-password') {
        alert('Senha muito fraca.');
      } else {
        alert('Erro ao criar conta.');
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
        textAlign: 'left'
      }}
    >
      <h2>Cadastrar Cliente</h2>

      <input
        type="text"
        placeholder="Nome do responsável"
        value={nomeResponsavel}
onChange={(e) => setNomeResponsavel(e.target.value)}
        style={{ width: 300 }}
      />
      <br />

      <input
        type="text"
        placeholder="Nome da loja"
        value={nomeLoja}
        onChange={(e) => setNomeLoja(e.target.value)}
        style={{ width: 300 }}
      />
      <br />

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: 300 }}
      />
      <br />

      <input
        type="text"
        placeholder="Whatsapp / Celular"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        style={{ width: 300 }}
      />
      <br />

      <input
        type="text"
        placeholder="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        style={{ width: 300 }}
      />
      <br />

    
      <br />

      

     

      <br />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: 300 }}
      />
      <br />

      <input
        type="password"
        placeholder="Confirmar senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: 300 }}
      />
      <br />

      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        style={{
          alignSelf: 'flex-start',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>

      <div style={{ marginTop: 16 }}>
        <Link to="/">
          Voltar para login
        </Link>
      </div>
    </div>
  );
}