import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getProducts } from "../../Redux/Actions/productsActions";
import ProductContainer from "../DefaultProducts/Container"; 

const CATEGORIES = [
    "Mobile & Devices",
    "Laptops & PCs",
    "Cameras & Photography",
    "Wearables",
    "TV & Entertainment",
    "Networking",
    "Peripherals"
];

const Discover = () => {
    const dispatch = useDispatch();
    const { products } = useSelector(state => state.getProducts);
    const location = useLocation();

    // Parse category from query string
    const queryParams = new URLSearchParams(location.search);
    const selectedCategory = queryParams.get('category');

    useEffect(() => {
        dispatch(getProducts());
    }, [dispatch]);

    // Determine which categories to display
    const filteredCategories = selectedCategory && selectedCategory !== "All Gadgets" 
        ? [selectedCategory] 
        : CATEGORIES;

    return (
        <Box style={{ marginTop: 60, padding: 20, minHeight: "80vh", backgroundColor: "#f1f3f6" }}>
            <Box style={{ padding: "15px", backgroundColor: "#fff", marginBottom: "10px", borderRadius: "4px" }}>
                <Typography variant="h5" style={{ fontWeight: 600, color: "#2874f0" }}>
                    {selectedCategory && selectedCategory !== "All Gadgets" ? `Category: ${selectedCategory}` : "Discover Categories"}
                </Typography>
                <Typography style={{ color: "#878787", marginTop: 5 }}>
                    {selectedCategory && selectedCategory !== "All Gadgets" 
                        ? `Showing all products in ${selectedCategory}`
                        : "Explore top categories and products curated just for you!"}
                </Typography>
            </Box>
            
            {products && products.length > 0 ? (
                filteredCategories.map(category => {
                    const categoryProducts = products.filter(p => p.category === category || p.category_name === category);
                    if (categoryProducts.length === 0) return null;
                    return (
                        <Box key={category} style={{ marginBottom: "20px", backgroundColor: "#fff", padding: "10px", borderRadius: "4px", paddingBottom: "30px" }}>
                            <ProductContainer title={category} products={categoryProducts} />
                        </Box>
                    );
                })
            ) : (
                <Typography style={{ textAlign: "center", marginTop: 40 }}>Loading products from database...</Typography>
            )}

            {selectedCategory && products && products.length > 0 && 
             !products.some(p => p.category === selectedCategory || p.category_name === selectedCategory) && 
             selectedCategory !== "All Gadgets" && (
                <Typography style={{ textAlign: "center", marginTop: 40, color: "#878787" }}>
                    No products found in "{selectedCategory}" category.
                </Typography>
            )}
        </Box>
    );
};

export default Discover;
