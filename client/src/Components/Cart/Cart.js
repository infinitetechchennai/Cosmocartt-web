import { Button, Grid, Typography, Divider, Box, Paper, CircularProgress, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { CartItem } from "./CartItem";
import EmptyCart from "./EmptyCart";
import axios from "axios";

export const Cart = () => {
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart) || [];
    const userType = localStorage.getItem("userType") || "b2c";
    
    const [shippingFee, setShippingFee] = useState(0);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [address, setAddress] = useState(null);

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        return sum + (price * item.quantity);
    }, 0);

    const stateGstTotal = cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        const percent = item.sgst || 0;
        return sum + (price * item.quantity * (percent / 100));
    }, 0);

    const centralGstTotal = cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        const percent = item.cgst || 0;
        return sum + (price * item.quantity * (percent / 100));
    }, 0);

    const totalGst = stateGstTotal + centralGstTotal;
    const grandTotal = subtotal + totalGst + shippingFee;

    useEffect(() => {
        // Fetch default address to calculate shipping if possible
        const fetchAddress = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/addresses`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data.data && response.data.data.length > 0) {
                    const defaultAddr = response.data.data.find(a => a.is_default) || response.data.data[0];
                    setAddress(defaultAddr);
                    const pin = defaultAddr.pincode || defaultAddr.postalCode || defaultAddr.postal_code;
                    calculateShipping(pin);
                }
            } catch (e) {
                console.error("Failed to fetch address", e);
            }
        };

        if (cartItems.length > 0) {
            fetchAddress();
        }
    }, [cartItems.length]);

    const calculateShipping = async (pincode) => {
        if (!pincode || cartItems.length === 0) return;
        
        setLoadingShipping(true);
        try {
            const token = localStorage.getItem("accessToken");
            const items = cartItems.map(item => ({
                quantity: item.quantity,
                weight: item.weight || 0,
                length: item.length || 0,
                breadth: item.breadth || 0,
                height: item.height || 0,
            }));

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/shipping/delhivery/estimate`, {
                delivery_pincode: pincode,
                items: items
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            setShippingFee(response.data.shipping_fee || 0);
        } catch (e) {
            console.error("Shipping calculation failed", e);
        } finally {
            setLoadingShipping(false);
        }
    };

    const proceedToCheckout = () => {
        if (!localStorage.getItem("userName")) {
            navigate("/login");
        } else {
            navigate("/checkout");
        }
    };

    if (cartItems.length === 0) {
        return <EmptyCart />;
    }

    return (
        <Box sx={{ p: { xs: 2, lg: 8 }, bgcolor: "#f1f3f6", minHeight: "90vh", mt: 8 }}>
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                <Grid container spacing={3}>
                    <Grid item lg={8} md={8} sm={12} xs={12}>
                        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                My Cart ({cartItems.length})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {cartItems.map(item => (
                                <CartItem item={item} key={item.id} />
                            ))}

                            <Box sx={{ textAlign: "right", p: 2, position: "sticky", bottom: 0, bgcolor: "white", boxShadow: "0 -2px 10px rgba(0,0,0,0.1)", zIndex: 1, mt: 2 }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={proceedToCheckout}
                                    sx={{ 
                                        backgroundColor: "#fb641b", 
                                        px: 4, 
                                        py: 1.5,
                                        fontWeight: "bold",
                                        "&:hover": { backgroundColor: "#e25a18" }
                                    }}
                                >
                                    PROCEED TO CHECKOUT
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item lg={4} md={4} sm={12} xs={12}>
                        <Paper elevation={0} sx={{ p: 2, position: "sticky", top: 100 }}>
                            <Typography variant="h6" sx={{ color: "#878787", fontWeight: 600, mb: 2 }}>
                                PRICE DETAILS
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography>Price ({cartItems.length} items)</Typography>
                                <Typography>₹{subtotal.toLocaleString()}</Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography>State GST</Typography>
                                <Typography>₹{stateGstTotal.toFixed(2)}</Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography>Central GST</Typography>
                                <Typography>₹{centralGstTotal.toFixed(2)}</Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography>Shipping Fee</Typography>
                                {loadingShipping ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <Typography color={shippingFee === 0 ? "success.main" : "text.primary"}>
                                        {shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 2, borderStyle: "dashed" }} />

                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total Amount</Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2874f0" }}>₹{grandTotal.toLocaleString()}</Typography>
                            </Box>

                            <Divider sx={{ mb: 2, borderStyle: "dashed" }} />
                            
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                {totalGst > 0 ? `Taxes included in total amount.` : `Clean price no extra taxes.`}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

