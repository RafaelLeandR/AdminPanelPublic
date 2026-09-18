//imports da planilha



import WhatsappButton from './WhatsappButton';
import ProductBulkImport from './ProductBulkImport';
import PeopleIcon from '@mui/icons-material/People';
//imports da planilha


import {PaginaInicialEdit, PaginaInicialCreate, PaginaInicialList} from './PaginaInicial';


import {SobreNosEdit, SobreNosCreate, SobreNosList } from './SobreNos';


import {ProductEdit, ProductCreate, ProductList} from './Products';


import {CategoryEdit, CategoryCreate, CategoryList} from './Categorias';
import {VendedoraEdit, VendedoraCreate, VendedoraList} from './Vendedoras';


import {BrandEdit, BrandCreate, BrandList} from './Brand';

import ForgotPasswordPage from './ForgotPasswordPage';
import {TagEdit, TagCreate, TagList } from './Tag';

import React from 'react';
import { Admin, Resource, Layout, CustomRoutes } from 'react-admin';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import portugueseMessages from 'ra-language-portuguese';

import authProvider from './authProvider';
import dataProvider from './dataProvider';


import RegisterPage from './Register';
import MyLoginPage from './MyLoginPage';
import MinhaContaPage from './MinhaContaPage';
import CustomAppBar from './CustomAppBar';

import InfoIcon from '@mui/icons-material/Info';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StoreIcon from '@mui/icons-material/Store';

const i18nProvider = polyglotI18nProvider(() => portugueseMessages, 'pt');
const CustomLayout = (props) => <Layout {...props} appBar={CustomAppBar} />;

function AdminApp() {
  return (
    <>
      
      <Admin
        authProvider={authProvider}
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        loginPage={MyLoginPage}
        layout={CustomLayout}
      >
        
        <CustomRoutes>
          <Route
  path="/esqueci-senha"
  element={<ForgotPasswordPage />}
/>
          <Route path="/minha-conta" element={<MinhaContaPage />} />
          <Route path="/products/bulk-import" element={<ProductBulkImport />} />
        </CustomRoutes>
        <Resource
          name="paginaInicial"
          list={PaginaInicialList}
          create={PaginaInicialCreate}
          edit={PaginaInicialEdit}
          options={{ label: 'Página Inicial - Lojas' }}
          icon={StoreIcon}
        />
       <Resource 
  name="vendedoras"
  list={VendedoraList}
  create={VendedoraCreate}
  edit={VendedoraEdit}
  icon={PeopleIcon}
  options={{ label: 'Vendedores' }}
/>

        <Resource
          name="sobreNos"
          list={SobreNosList}
          edit={SobreNosEdit}
          create={SobreNosCreate}
          icon={InfoIcon}
          options={{ label: 'Sobre nós' }}
        />

        <Resource
          name="products"
          list={ProductList}
          edit={ProductEdit}
          create={ProductCreate}
          icon={InventoryIcon}
          options={{ label: 'Produtos' }}
        />

        <Resource
          name="categorias"
          list={CategoryList}
          edit={CategoryEdit}
          create={CategoryCreate}
          icon={CategoryIcon}
          options={{ label: 'Categorias' }}
        />

        <Resource
          name="marcas"
          list={BrandList}
          edit={BrandEdit}
          create={BrandCreate}
          icon={BrandingWatermarkIcon}
          options={{ label: 'Marca' }}
        />

        <Resource
          name="tags"
          list={TagList}
          edit={TagEdit}
          create={TagCreate}
          icon={LocalOfferIcon}
          options={{ label: 'Tags' }}
        />

        
      </Admin>
      <WhatsappButton />
      </>
    
  );
}

/* =========================
   APP
========================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;