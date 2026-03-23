import { Box, IconButton, InputBase, List, TextField } from "@mui/material";
import "../styles.css"
import React, { useEffect, useState } from "react";

import { getProducts } from "../../Redux/Actions/productsActions";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';


const Search = () => {

    const dispatch = useDispatch();

    const [data, setData] = useState("");
    const { products } = useSelector(state => state.getProducts);


    useEffect(() => {
        dispatch(getProducts);
    }, [dispatch])

    function onChange(e) {

        setData(e.target.value);
        console.log(data);

    }


    return (

        <div className="input-container">
            <IconButton>
                <SearchIcon />
            </IconButton>
            <input onChange={onChange} placeholder="Search for Products, Brands and more" />


            <div style={{ backgroundColor: "orange", position: "absolute" }}>
                {data &&

                    products.filter(product => {
                        
                        return product.title.longTitle.includes(data)
                    }
                    ).map(product=> {
                        console.log(product)
                    })
                }
            </div>
        </div>
    )


}

export default Search;