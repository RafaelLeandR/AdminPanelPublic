import { Login, LoginForm } from 'react-admin';

const MyLoginPage = () => (
  <Login>
    <LoginForm />
    <div style={{ marginTop: 16, textAlign: 'center' }}>
      <a href="/register">Cadastrar</a>
    </div>
  </Login>
);

export default MyLoginPage;