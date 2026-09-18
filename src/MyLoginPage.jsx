import { Login, LoginForm } from 'react-admin';

const MyLoginPage = () => (
  <Login>
    <LoginForm />

    <div
      style={{
        marginTop: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <a
        href="/register"
        style={{
          display: 'inline-block',
          padding: '10px 18px',
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#1e3a8a';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Cadastrar
      </a>

      <a
        href="/esqueci-senha"
        style={{
          display: 'inline-block',
          padding: '10px 18px',
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.2s ease',
          marginBottom: "30px"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#1e3a8a';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Esqueci minha senha
      </a>
    </div>
  </Login>
);

export default MyLoginPage;