import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';

const errorMessages = {
  "auth/user-not-found": "Usuário não encontrado",
  "auth/wrong-password": "Senha incorreta",
  "auth/invalid-email": "E-mail inválido",
  "auth/too-many-requests": "Muitas tentativas. Tente mais tarde",
};

auth.useDeviceLanguage();
auth.languageCode = 'pt-BR';

const authProvider = {
  login: async ({ username, password }) => {
    try {
      await signInWithEmailAndPassword(auth, username, password);
      return Promise.resolve();
    } catch (error) {
      const message =
        errorMessages[error.code] || "Erro ao fazer login";

      return Promise.reject(new Error(message));
    }
  },

  logout: async () => {
    await signOut(auth);
    return Promise.resolve();
  },

  checkAuth: async () => {
    return auth.currentUser ? Promise.resolve() : Promise.reject();
  },

  checkError: async () => Promise.resolve(),

  getIdentity: async () => {
    const user = auth.currentUser;

    if (!user) {
      return Promise.reject();
    }

    return Promise.resolve({
      id: user.uid,
      fullName: user.email,
    });
  },

  getPermissions: async () => Promise.resolve(),
};

export default authProvider;