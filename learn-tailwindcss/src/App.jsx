import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import Checkout from './components/Checkout/Checkout2'
import Contact from './components/Contact';
import Profile from './components/Profile/Profile';
import Orders from './components/Orders';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {

  return (
        <BrowserRouter>
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            <Route path='/contacto' element={<Contact/>}/>
            <Route path='/perfil' element={<Profile/>}/>
            <Route path='/pedidos' element={<Orders/>}/>
          </Routes>
          <Footer/>
          <ScrollToTop/>
        </BrowserRouter>
        
  )
}

export default App
