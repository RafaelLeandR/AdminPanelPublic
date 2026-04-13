import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [nomeLoja, setNomeLoja] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [plano, setPlano] = useState('leve');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (
      !nomeCliente ||
      !nomeLoja ||
      !email ||
      !whatsapp ||
      !endereco ||
      !cpfCnpj ||
      !plano ||
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'clientes', user.uid), {
        idCliente: user.uid,
        nomeCliente,
        nomeLoja,
        email,
        whatsapp,
        endereco,
        cpfCnpj,
        plano,
        createdAt: new Date()
      });

      alert('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      alert(error.message);
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
      <h2 style={{ textAlign: 'left' }}>Cadastrar Cliente</h2>

      <input
        type="text"
        placeholder="Nome do cliente"
        value={nomeCliente}
        onChange={(e) => setNomeCliente(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />

      <input
        type="text"
        placeholder="Nome da loja"
        value={nomeLoja}
        onChange={(e) => setNomeLoja(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />

      <input
        type="text"
        placeholder="Whatsapp / Celular"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />

      <input
        type="text"
        placeholder="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />

      <input
        type="text"
        placeholder="CPF ou CNPJ"
        value={cpfCnpj}
        onChange={(e) => setCpfCnpj(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />
      <label>Plano</label>
      <select
        value={plano}
        onChange={(e) => setPlano(e.target.value)}
        style={{ width: 310, textAlign: 'left' }}
      >
        <option value="leve">Leve (até 100 produtos)</option>
        <option value="pro">Pro (até 500 produtos)</option>
      </select>
      <br />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />

      <input
        type="password"
        placeholder="Confirmar senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: 300, textAlign: 'left' }}
      />
      <br />

      <button onClick={handleRegister} style={{ alignSelf: 'flex-start' }}>
        Criar conta
      </button>

      <div style={{ marginTop: 16, textAlign: 'left' }}>
        <Link to="/">Voltar para login</Link>
      </div>
    </div>
  );
}