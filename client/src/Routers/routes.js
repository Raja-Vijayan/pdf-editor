import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginAccessCode from '../Login/LoginAccessCode';
import Main from '../pages/Main';
import Dashboard from '../components/Dashboard';
import Users from '../components/Users';
import Orders from '../components/Orders';
import Payments from '../components/Payments';
import DesignAssets from '../components/DesignAssets';
import Schools from '../components/Schools';
import Purchases from '../components/Purchases';
import SavedYearBook from '../components/SavedYearbooks';
import CreateUser from '../components/CreateUser';
import Carts from '../components/Carts';
import PrivateRoute from '../Routers/PrivateRoute';
import AddCart from '../components/AddCart';
import UploadFiles from '../components/UploadFiles'
import Links from '../components/Links';
import PaymentPage from '../components/PaymentPage'


export default function ApplicationRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginAccessCode />} />
        <Route path="/design/edit" element={<PrivateRoute component={Main} />} />
        <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
        <Route path="/profile" element={<PrivateRoute component={Users} />} />
        <Route path="/orders" element={<PrivateRoute component={Orders} />} />
        <Route path="/payments" element={<PrivateRoute component={Payments} />} />
        <Route path="/design_assets" element={<PrivateRoute component={DesignAssets} />} />
        <Route path="/schools" element={<PrivateRoute component={Schools} />} />
        <Route path="/purchase" element={<PrivateRoute component={Purchases} />} />
        <Route path="/saved" element={<PrivateRoute component={SavedYearBook} />} />
        <Route path="/create_user" element={<PrivateRoute component={CreateUser} />} />
        <Route path="/carts" element={<PrivateRoute component={Carts} />} />
        <Route path="/upload_pdf" element={<PrivateRoute component={Carts} />} />
        <Route path='/Addcarts' element={<PrivateRoute component={AddCart}/>}/>
        <Route path='/upload_files' element={<PrivateRoute component={UploadFiles} />} />
        <Route path="/links" element={<PrivateRoute component={Links} />} />
        <Route path="/payment_gateway" element={<PrivateRoute component={PaymentPage} />} />

      </Routes>
    </BrowserRouter>
  );
}
