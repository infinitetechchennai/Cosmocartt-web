
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button, Grid, Typography, Divider, Box, CircularProgress, Paper } from "@mui/material"
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReplayIcon from '@mui/icons-material/Replay';

import { useDispatch } from "react-redux";
import { addToCart } from "../../Redux/Actions/cartActions";

export const DetailsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { id } = useParams();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [userType, setUserType] = useState(localStorage.getItem("userType") || "b2c");

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}?user_type=${userType}`);
                setProduct(response.data);
            }
            catch (e) {
                console.log(`${e} : while fetching product details`);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, userType]);

    const addItemToCart = () => {
        dispatch(addToCart(id, quantity));
        navigate("/cart");
    }

    const buyNow = () => {
        dispatch(addToCart(id, quantity));
        navigate("/cart");
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!product) {
        return (
            <Box textAlign="center" mt={10}>
                <Typography variant="h5">Product not found</Typography>
                <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>Back to Home</Button>
            </Box>
        );
    }

    const currentPrice = product.priceAfetDiscount || product.current_price || product.b2c_price || (product.price && product.price.cost) || 0;
    const mrp = product.original_price || (product.price && product.price.mrp) || product.b2c_price || currentPrice;
    const discount = product.discount_percentage || product.discountPercentUI || (product.price && product.price.discount) || 0;

    return (
        <div className="details-container">
            <Grid container spacing={4}>
                {/* Left side: Images and Action Buttons */}
                <Grid item lg={5} md={5} xs={12}>
                    <div className="left-container">
                        <Paper elevation={0} sx={{ border: "1px solid #f0f0f0", p: 2, textAlign: "center", mb: 2 }}>
                            <img 
                                src={product.detailUrl || product.image || product.url} 
                                alt={product.title?.longTitle || product.name} 
                                style={{ maxWidth: '100%', height: 'auto', maxHeight: '450px' }}
                            />
                        </Paper>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Button 
                                    fullWidth
                                    size="large"
                                    onClick={addItemToCart}
                                    startIcon={<ShoppingCartOutlinedIcon />}
                                    sx={{ 
                                        backgroundColor: "#fbb13c", 
                                        color: "white",
                                        py: 1.5,
                                        '&:hover': { backgroundColor: "#e29e34" }
                                    }}
                                    variant="contained"
                                >
                                    Add to Cart
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    sx={{ 
                                        backgroundColor: "#f4511e", 
                                        color: "white",
                                        py: 1.5,
                                        '&:hover': { backgroundColor: "#d84315" }
                                    }}
                                    startIcon={<FlashOnIcon />}
                                    onClick={buyNow}
                                >
                                    Buy Now
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </Grid>

                {/* Right side: Product Info */}
                <Grid item lg={7} md={7} xs={12}>
                    <div className="right-container">
                        <Typography variant="h5" sx={{ fontWeight: 500, color: "#212121", mb: 1 }}>
                            {product.name || (product.title && product.title.longTitle)}
                        </Typography>

                        <Box display="flex" alignItems="baseline" gap={2} mb={2}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                ₹{currentPrice.toLocaleString()}
                            </Typography>
                            {mrp > currentPrice && (
                                <Typography variant="body1" sx={{ color: "#878787", textDecoration: "line-through" }}>
                                    ₹{mrp.toLocaleString()}
                                </Typography>
                            )}
                            {discount > 0 && (
                                <Typography variant="body1" sx={{ color: "#388E3C", fontWeight: 600 }}>
                                    {discount}% off
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Product Details Section */}
                        <Box mb={3}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Product Details
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                                {product.description || "No detailed description available."}
                            </Typography>
                        </Box>

                        {/* Return Policy Section */}
                        <Box mb={3} display="flex" alignItems="start" gap={1}>
                            <ReplayIcon color="primary" sx={{ mt: 0.5 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Return Policy
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    {product.returnPolicy || "7 Days Replacement Policy."}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Trust Badges */}
                        <Box display="flex" gap={4} py={2} borderTop="1px solid #f0f0f0" borderBottom="1px solid #f0f0f0">
                            <Box display="flex" alignItems="center" gap={1}>
                                <VerifiedUserIcon color="success" />
                                <Typography variant="body2" fontWeight={500}>100% Authentic</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <ReplayIcon color="primary" />
                                <Typography variant="body2" fontWeight={500}>Easy Returns</Typography>
                            </Box>
                        </Box>

                        {/* Additional Info Table */}
                        <Box mt={4}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Information
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <Typography color="textSecondary">Category</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography fontWeight={500}>{product.category || "General"}</Typography>
                                </Grid>
                                
                                <Grid item xs={4}>
                                    <Typography color="textSecondary">Brand</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography fontWeight={500}>{product.brand || product.brandName || "Generic"}</Typography>
                                </Grid>

                                <Grid item xs={4}>
                                    <Typography color="textSecondary">Availability</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography color={product.isAvailable !== false ? "success.main" : "error.main"} fontWeight={500}>
                                        {product.isAvailable !== false ? "In Stock" : "Out of Stock"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                    </div>
                </Grid>
            </Grid>
        </div>
    )
}