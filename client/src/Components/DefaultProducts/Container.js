import axios from "axios"
import { useEffect, useState } from "react";
import LinearProgress from '@mui/material/CircularProgress';
import NavCard from "../Home/NavCard";
import { ProductCard } from "./ProductCard";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";




const ProductContainer = (props) => {
    const allProducts = props.products || props.fetchproducts?.products || [];

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 6,

        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 4,// optional, default to 1.
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 2,
            slidesToSlide: 1 // optional, default to 1.
        }
    };

    return (


        <div className="products-container">


            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <p style={{
                    fontWeight: "600",
                    fontSize: "20px"
                }}>{props.title || "Deals of The Day"}</p>

                <Button style={{ padding: "10px 15px", height: "auto" }} variant="contained">Continue</Button>
            </div>
            <Carousel responsive={responsive} swipeable={false} draggable={false} infinite={true} autoPlay={true}>

                {


                    allProducts.map(product =>
                        <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "black" }}>
                            <ProductCard key={Math.random()} props={product} />
                        </Link>
                    )
                }
            </Carousel>





        </div>




    )

}

export default ProductContainer;