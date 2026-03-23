import React from "react";
import './App.css';
import Home from './Components/Home/Home.js';
import Login from './Components/Login/Login.js';
import Header from './Components/header/Header';
import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store.js"
import { DetailsPage } from "./Components/Details/DetailsPage.js";
import { Cart } from "./Components/Cart/Cart.js";
import OrderHistory from "./Components/OrderHistory/OrderHistory.js";
import Discover from "./Components/Discover/Discover.js";
import Profile from "./Components/Profile/Profile.js";
import BottomNav from "./Components/BottomNav/BottomNav.js";
import Checkout from "./Components/Checkout/Checkout.js";
import Payment from "./Components/Payment/Payment.js";

function App() {
  return (

    <div>
  <Provider store={store}>
    <Header />
    <Routes>

    <Route path='/' element={ <Home /> }  />    
    <Route path='/login' element={ <Login /> }  />
    <Route path='/discover' element={ <Discover/> }  />
    <Route path='/profile' element={ <Profile/> }  />
    <Route path='/products/:id' element={ <DetailsPage/> }  />
    <Route path='/cart' element={ <Cart/> }  />
    <Route path='/orders' element={ <OrderHistory/> }  />
    <Route path='/checkout' element={ <Checkout/> }  />
    <Route path='/payment' element={ <Payment/> }  />
    </Routes>
    <BottomNav />
    </Provider>
   
    </div>
  )

}

export default App;
