import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Navbar from './components/Navbar'
import Menu from './components/Menu'
import Checkout from './components/Checkout'
import Contact from './components/Contact';
import Profile from './components/Profile';
import Orders from './components/Orders';

function App() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    console.log("CART ACTUAL:", cart)
  }, [cart])

  const addToCart = (product)=>{
    setCart(prevCart =>{
      const existing = prevCart.find(item => item.id == product.id)

      if(existing){
        return prevCart.map(item => {
          return item.id === product.id ?
          {...item, quantity: item.quantity + 1} 
          : item
        })
      }

      return [...prevCart, {...product, quantity: 1}]
    })
  }

  const removeFromCart = (id)=>{
    return setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const updateQuantity = (id, amount)=>{
    setCart(prevCart => prevCart.map(item => {
      return item.id === id ? {...item, quantity: Math.max(1, item.quantity + amount)} 
      : item
    }))
  }

  const total = cart.reduce(
      (acc, item) =>
        acc + Number(item.price) * item.quantity,
      0
  )

  return (
        <BrowserRouter>
          <Navbar
          cart={cart}
          total={total}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          />
          <Routes>
            <Route path="/" element={<Menu addToCart={addToCart}/>}/>
            <Route path="/checkout" element={<Checkout cart={cart} total={total}/>}/>
            <Route path='/contacto' element={<Contact/>}/>
            <Route path='/perfil' element={<Profile/>}/>
            <Route path='/pedidos' element={<Orders/>}/>
          </Routes>
        </BrowserRouter>
  )
}

export default App
