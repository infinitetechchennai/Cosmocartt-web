import React, { useState, useEffect } from "react";
import { Button, Grid, Typography, Paper, Box, Divider, TextField, CircularProgress, IconButton } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { deleteCart } from "../../Redux/Actions/cartActions";

const Payment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.cart) || [];
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Seller state for GST calculation
    const SELLER_STATE = "Tamil Nadu";
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [shippingFee, setShippingFee] = useState(0);
    const [loadingShipping, setLoadingShipping] = useState(false);

    useEffect(() => {
        const savedAddress = localStorage.getItem("checkoutAddress");
        if (savedAddress) {
            const addr = JSON.parse(savedAddress);
            setAddress(addr);
            const pin = addr.pincode || addr.postalCode || addr.postal_code;
            calculateShipping(pin);
        } else {
            navigate("/checkout");
        }

        // Load Razorpay Script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            const razorpayScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (razorpayScript) {
                document.body.removeChild(razorpayScript);
            }
        };
    }, [navigate]);

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

    // Calculate totals (same as Cart.js/Checkout.js)
    const isSameState = address?.state?.toLowerCase() === SELLER_STATE.toLowerCase();
    
    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        return sum + (price * item.quantity);
    }, 0);

    const totalGstAmount = cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        const totalRate = (item.sgst || 0) + (item.cgst || 0);
        return sum + (price * item.quantity * (totalRate / 100));
    }, 0);

    const stateGstTotal = isSameState ? cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        return sum + (price * item.quantity * ((item.sgst || 0) / 100));
    }, 0) : 0;

    const centralGstTotal = isSameState ? cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        return sum + (price * item.quantity * ((item.cgst || 0) / 100));
    }, 0) : 0;

    const igstTotal = isSameState ? 0 : totalGstAmount;
    const grandTotal = subtotal + totalGstAmount + shippingFee - couponDiscount;

    const applyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/coupons/apply`, {
                coupon_code: couponCode,
                subtotal: subtotal
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.data.success) {
                setAppliedCoupon(response.data.coupon_code);
                setCouponDiscount(response.data.discount_amount);
                alert(response.data.message);
            } else {
                alert(response.data.detail || "Invalid coupon");
            }
        } catch (e) {
            alert(e.response?.data?.detail || "Failed to apply coupon");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handlePayment = async () => {
        if (!window.Razorpay) {
            alert("Razorpay SDK not loaded. Please wait or refresh.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const config = {
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            };

            // 1. Create Razorpay Order
            const { data: orderParams } = await axios.post(`${process.env.REACT_APP_API_URL}/payment/create-order`, {
                amount: grandTotal,
                currency: "INR"
            }, config);

            const internalOrderId = "ORD-" + Math.floor(Math.random() * 1000000000);

            const options = {
                key: orderParams.key,
                amount: orderParams.amount,
                currency: "INR",
                name: "Cosmocrartt",
                description: "Product Purchase",
                order_id: orderParams.order_id,
                handler: async function (response) {
                    try {
                        // 2. Verify Payment
                        const verifyRes = await axios.post(`${process.env.REACT_APP_API_URL}/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: internalOrderId
                        }, config);

                        if (verifyRes.data.success) {
                            // 3. Place Final Order
                            const productsArr = cartItems.map(item => ({
                                product_id: item.id,
                                name: item.title?.longTitle || item.name || "Product",
                                price: item.price?.cost || item.current_price || 0,
                                imageUrl: item.url || item.image || item.detailUrl || "",
                                quantity: item.quantity,
                                colorHex: item.colorHex || "FFFFFFFF",
                                hsnCode: item.hsn || "",
                                weightKg: item.weight || 0,
                                lengthCm: item.length || 0,
                                breadthCm: item.breadth || 0,
                                heightCm: item.height || 0,
                                sgst_percentage: item.sgst || 0,
                                cgst_percentage: item.cgst || 0
                            }));

                            const now = new Date();
                            const day = String(now.getDate()).padStart(2, '0');
                            const month = String(now.getMonth() + 1).padStart(2, '0');
                            const year = now.getFullYear();
                            const placedOn = `${day}/${month}/${year}`;

                            const placeOrderData = {
                                order_id: internalOrderId,
                                placed_on: placedOn,
                                order_status: "ordered",
                                customer_name: address.name,
                                products: productsArr,
                                total_price: grandTotal,
                                shipping_fee: shippingFee,
                                state_gst_amount: stateGstTotal,
                                central_gst_amount: centralGstTotal,
                                igst_amount: igstTotal,
                                sgst_percentage: cartItems.length > 0 ? (cartItems[0].sgst || 0) : 0, // Fallback for order level
                                cgst_percentage: cartItems.length > 0 ? (cartItems[0].cgst || 0) : 0, // Fallback for order level
                                pincode: address.pincode,
                                city: address.city,
                                state: address.state,
                                customer_email: localStorage.getItem("userEmail") || localStorage.getItem("userName") || "guest@example.com",
                                phone: address.phone,
                                customer_address_text: `${address.addressLine}, ${address.locality}, ${address.city}, ${address.state} - ${address.pincode}`,
                                payment_status: "completed",
                                payment_method: verifyRes.data.payment_method || "Online",
                                customer_type: localStorage.getItem("userType") || "b2c"
                            };

                            await axios.post(`${process.env.REACT_APP_API_URL}/orders/place`, placeOrderData, config);
                            localStorage.removeItem("checkoutAddress");
                            dispatch(deleteCart());
                            navigate("/orders");
                        }
                    } catch (e) {
                        console.error("Verification/Order failed", e);
                        alert("Payment successful but order placement failed. Please contact support.");
                    }
                },
                prefill: {
                    name: address.name,
                    email: localStorage.getItem("userName") || "",
                    contact: address.phone
                },
                theme: {
                    color: "#2874f0"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (e) {
            console.error("Payment initiation failed", e);
            alert("Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!address || cartItems.length === 0) return null;

    return (
        <Box sx={{ p: { xs: 2, lg: 8 }, bgcolor: "#f1f3f6", minHeight: "90vh", mt: 8 }}>
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                <Grid container spacing={3}>
                    <Grid item lg={8} md={8} sm={12} xs={12}>
                        {/* Address Summary */}
                        <Paper sx={{ p: 3, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                    <CheckCircleIcon color="success" /> Delivery Address
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>{address.name} | {address.phone}</Typography>
                                <Typography variant="body2">{address.addressLine}, {address.locality}, {address.city}, {address.state} - {address.pincode}</Typography>
                            </Box>
                            <Button size="small" onClick={() => navigate("/checkout")}>Change</Button>
                        </Paper>

                        {/* Order Summary / Products */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Order Summary</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {cartItems.map(item => (
                                <Box key={item.id} sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <img src={item.url || item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: "contain" }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>{item.title?.longTitle || item.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">Qty: {item.quantity}</Typography>
                                        <Typography variant="body2" fontWeight={600}>₹{(item.price?.cost || item.current_price || 0).toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Paper>

                        {/* Coupon Section */}
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <LocalOfferIcon color="primary" /> Apply Coupon
                            </Typography>
                            {appliedCoupon ? (
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ bgcolor: "#f6ffed", p: 1.5, border: "1px dashed #b7eb8f", borderRadius: 1 }}>
                                    <Typography color="success.main" fontWeight={500}>Coupon <Box component="span" fontWeight="bold">"{appliedCoupon}"</Box> Applied!</Typography>
                                    <Button size="small" color="error" onClick={() => { setAppliedCoupon(null); setCouponDiscount(0); }}>Remove</Button>
                                </Box>
                            ) : (
                                <Box display="flex" gap={1}>
                                    <TextField 
                                        fullWidth 
                                        placeholder="Enter Coupon Code" 
                                        size="small" 
                                        value={couponCode} 
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                    <Button 
                                        variant="outlined" 
                                        disabled={isApplyingCoupon || !couponCode} 
                                        onClick={applyCoupon}
                                    >
                                        {isApplyingCoupon ? <CircularProgress size={20} /> : "APPLY"}
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item lg={4} md={4} sm={12} xs={12}>
                        <Paper sx={{ p: 3, position: "sticky", top: 100 }}>
                            <Typography variant="h6" sx={{ color: "#878787", fontWeight: 600, mb: 2 }}>
                                PRICE DETAILS
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography>Price ({cartItems.length} items)</Typography>
                                <Typography>₹{subtotal.toLocaleString()}</Typography>
                            </Box>

                            {isSameState ? (
                                <>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>CGST</Typography>
                                        <Typography>₹{centralGstTotal.toFixed(2)}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>SGST</Typography>
                                        <Typography>₹{stateGstTotal.toFixed(2)}</Typography>
                                    </Box>
                                </>
                            ) : (
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>IGST</Typography>
                                    <Typography>₹{igstTotal.toFixed(2)}</Typography>
                                </Box>
                            )}

                            {couponDiscount > 0 && (
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>Coupon Discount</Typography>
                                    <Typography color="success.main">- ₹{couponDiscount.toLocaleString()}</Typography>
                                </Box>
                            )}

                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography>Delivery Charges</Typography>
                                {loadingShipping ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <Typography color={shippingFee === 0 ? "success.main" : "text.primary"}>
                                        {shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 2, borderStyle: "dashed" }} />

                            <Box display="flex" justifyContent="space-between" mb={3}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total Payable</Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2874f0" }}>₹{grandTotal.toLocaleString()}</Typography>
                            </Box>

                            <Button 
                                onClick={handlePayment} 
                                fullWidth 
                                variant="contained" 
                                sx={{ 
                                    backgroundColor: "#fb641b", 
                                    py: 1.5,
                                    fontSize: "16px", 
                                    fontWeight: "bold",
                                    "&:hover": { backgroundColor: "#e25a18" }
                                }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : `PAY ₹${grandTotal.toLocaleString()}`}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Payment;
