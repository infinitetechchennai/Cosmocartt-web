
import Banner from "./Carousel"
import ProductBar from "./ProductBar"
import ProductContainer from "../DefaultProducts/Container";
import Header from "../header/Header";
import React, { useEffect } from "react";
import { getProducts } from "../../Redux/Actions/productsActions";
import { useDispatch, useSelector } from "react-redux";


const Home = () => {
   
    const allProductsDict = useSelector(state => state.getProducts);
    const dispatch = useDispatch();

    useEffect(() => {

        dispatch(getProducts())

    }, [dispatch])

    




    return (<div>
        
        <Header />
        <ProductBar />
        <Banner />
        <ProductContainer fetchproducts={allProductsDict} />
        <ProductContainer fetchproducts={allProductsDict} />
        <ProductContainer fetchproducts={allProductsDict} />


    </div>)
}
export default Home;    