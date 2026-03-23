
import { AppBar, Badge, Box, Button, Toolbar, styled } from "@mui/material"
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Search from "./Search";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/cosmocrartt.png";
import { useSelector } from "react-redux";


const Header = () => {
    const [cartItems,setCartItems] = useState(0);
    const navigate = useNavigate();
    
   <img
  onClick={() => navigate("/")}
  style={{ cursor: "pointer" }}
  src={logo}    alt="logo"
/>


    const firstName = localStorage.getItem("firstName");
    const products = useSelector(state=> state.cart);

    useEffect(()=>{
        
        setCartItems(products.length);
    },[products])



    return (<AppBar style={{ width: "100%", boxShadow: "none", height: "55px" }}>

        <Box style={{ width: "100%" }}>

            <Toolbar
  style={{
    backgroundColor: "white",
    height: "70px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
 <div className="main-right-container" >
 <img
  onClick={() => navigate("/")}
  src={logo}
  alt="logo"
  style={{
    height: "60px",        // 🔥 important
    width: "auto",
    objectFit: "contain",
    cursor: "pointer",
  }}
/>
                    <Search />
                </div>

                <div className="icons-container">

                    {firstName ? <Button onClick={() => {
                        navigate("/profile");
                    }} variant="text" disableElevation startIcon={<AccountCircleOutlinedIcon />}>
                        <p>  {firstName} </p>
                    </Button> : 
                    
                    
                    <Button onClick={() => {
                        navigate("/login")
                    }} variant="text" disableElevation startIcon={<AccountCircleOutlinedIcon />}>
                        <p>  Login </p>
                    </Button>}

                    <Button onClick={()=>{
                        navigate("/discover");
                    }}  variant="text" disableElevation startIcon={<ExploreOutlinedIcon /> }>
                        <p>  Discover</p>
                    </Button>

                    <Button onClick={()=>{
                        navigate("/orders");
                    }}  variant="text" disableElevation startIcon={<LocalShippingOutlinedIcon /> }>
                        <p>  Your Orders</p>
                    </Button>

                    <Button onClick={()=>{
                        navigate("/cart");
                    }}  variant="text" disableElevation startIcon={ <Badge badgeContent={cartItems}  color="primary"><ShoppingCartOutlinedIcon /></Badge> }>
                        <p>  Cart</p>
                    </Button>
                    <Button variant="text" disableElevation startIcon={<StorefrontOutlinedIcon />}>
                        <p>  Become a Seller</p>
                    </Button>
                </div>




            </Toolbar>
        </Box>



    </AppBar>)
}

export default Header;