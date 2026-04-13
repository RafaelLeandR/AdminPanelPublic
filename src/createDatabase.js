import { doc, setDoc, collection } from 'firebase/firestore';

import { createUserWithEmailAndPassword } from 'firebase/auth';

import { auth, db } from './firebase';

async function criarCliente() {
  try {
    

 const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    const idCliente = user.uid;

    await setDoc(doc(db, 'clientes', idCliente), {
        uid: idCliente,
      nomeCliente: 'Carlos',
      email: 'carlos@email.com',
      senha: '1234',
      whatsappCelular: '11999999999',
      endereco: 'Rua A, 100',
      cpfCnpj: '12345678900',
      plano: 'pro',
      status: 'ativo'
    });

    const storeRef = doc(collection(db, 'clientes', idCliente, 'stores'));
    const idStore = storeRef.id;

    await setDoc(storeRef, {
      idStore,
      nomeStore: 'Loja do Carlos',
      urlStore: 'lojadocarlos',
      status: 'ativo'
    });

    await setDoc(doc(db, 'clientes', idCliente, 'stores', idStore, 'paginaInicial', 'conteudo'), {
      iconeLoja: '',
      telefoneLigacoes: '',
      whatsapp: '',
      entregaGratis: true,
      entregaGratisPreco: 0,
      imagensCarrossel: [],
      textoCarrossel: '',
      textoBtnCarrossel: '',
      imgsCarrosselLogos: [],
      corDosBotoes: '#000000'
    });

    await setDoc(doc(db, 'clientes', idCliente, 'stores', idStore, 'sobreNos', 'conteudo'), {
      enderecoGoogleMaps: '',
      telefoneLigacoes: '',
      whatsapp: '',
      email: '',
      facebook: '',
      instagram: '',
      youtube: '',
      x: '',
      descricao: ''
    });

    const idProduto = 'produto1';
    await setDoc(doc(db, 'clientes', idCliente, 'stores', idStore, 'produtos', idProduto), {
      idProduto,
      idStore,
      codigoBarras: '7891234567890',
      nome: 'Camiseta Azul',
      preco: 59.90,
      precoRiscado: 79.90,
      descricao: 'Camiseta de algodão confortável',
      categoria: 'Roupas',
      marca: 'Nike',
      imagens: [],
      peso: '300g',
      dimensoes: '30x20x5cm',
      materiais: 'Algodão'
    });

    const idCat = 'cat1';
    await setDoc(doc(db, 'clientes', idCliente, 'stores', idStore, 'categorias', idCat), {
      idCat,
      idStore,
      nomeCat: ''
    });

    const idMarca = 'marca1';
    await setDoc(doc(db, 'clientes', idCliente, 'stores', idStore, 'marcas', idMarca), {
      idMarca,
      idStore,
      nomeMarca: ''
    });

    const idTag = 'tag1';
    await setDoc(doc(db, 'clientes', idCliente, 'stores', idStore, 'tags', idTag), {
      idTag,
      idStore,
      nomeTag: ''
    });

    alert('Cliente e estrutura da loja criados com sucesso!');
  } catch (error) {
    console.error(error);
    alert('Erro ao criar estrutura');
  }
}