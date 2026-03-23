import React, { useState, useEffect } from "react";
import { Button, Grid, TextField, Typography, Paper, Box, Divider, FormControlLabel, Radio, RadioGroup, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart) || [];
    
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);
    const [loadingShipping, setLoadingShipping] = useState(false);
    
    // Seller state for GST calculation
    const SELLER_STATE = "Tamil Nadu";
    
    const [newAddress, setNewAddress] = useState({
        name: localStorage.getItem("firstName") || "",
        phone: "",
        pincode: "",
        locality: "",
        addressLine: "",
        city: "",
        state: "",
        landmark: ""
    });

    const [isAddingNew, setIsAddingNew] = useState(false);

    useEffect(() => {
        if (selectedAddressId) {
            const addr = savedAddresses.find(a => a.id === selectedAddressId);
            if (addr) {
                const pin = addr.pincode || addr.postalCode || addr.postal_code;
                calculateShipping(pin);
            }
        }
    }, [selectedAddressId, cartItems.length]);

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

            const response = await axios.post("http://127.0.0.1:8000/shipping/delhivery/estimate", {
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

    // Get selected address object
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);
    const buyerState = isAddingNew ? newAddress.state : (selectedAddress?.state || "");

    const isSameState = buyerState.toLowerCase() === SELLER_STATE.toLowerCase();

    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        return sum + (price * item.quantity);
    }, 0);

    const totalGstAmount = cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        const sgstRate = item.sgst || 0;
        const cgstRate = item.cgst || 0;
        const totalRate = sgstRate + cgstRate;
        return sum + (price * item.quantity * (totalRate / 100));
    }, 0);

    const stateGstTotal = isSameState ? cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        return sum + (price * item.quantity * (item.sgst / 100));
    }, 0) : 0;

    const centralGstTotal = isSameState ? cartItems.reduce((sum, item) => {
        const price = item.price?.cost || item.current_price || 0;
        return sum + (price * item.quantity * (item.cgst / 100));
    }, 0) : 0;

    const igstTotal = isSameState ? 0 : totalGstAmount;
    const grandTotal = subtotal + totalGstAmount + shippingFee;

    useEffect(() => {
        const fetchAddresses = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            
            setLoadingAddresses(true);
            try {
                const response = await axios.get("http://127.0.0.1:8000/users/addresses", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data.data && response.data.data.length > 0) {
                    setSavedAddresses(response.data.data);
                    const defaultAddr = response.data.data.find(a => a.is_default) || response.data.data[0];
                    setSelectedAddressId(defaultAddr.id);
                } else {
                    setIsAddingNew(true);
                }
            } catch (e) {
                console.error("Failed to fetch address", e);
                setIsAddingNew(true);
            } finally {
                setLoadingAddresses(false);
            }
        };

        if (cartItems.length > 0) {
            fetchAddresses();
        }
    }, [cartItems.length]);

    const handleNewAddressChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const proceedToPayment = () => {
        let finalAddress = null;
        
        if (isAddingNew) {
            if (!newAddress.name || !newAddress.phone || !newAddress.pincode || !newAddress.addressLine || !newAddress.city || !newAddress.state) {
                alert("Please fill all mandatory address fields");
                return;
            }
            finalAddress = newAddress;
        } else {
            finalAddress = savedAddresses.find(a => a.id === selectedAddressId);
            if (!finalAddress) {
                alert("Please select or add an address");
                return;
            }
        }
        
        localStorage.setItem("checkoutAddress", JSON.stringify(finalAddress));
        navigate("/payment");
    };

    if (cartItems.length === 0) {
        return (
            <Box sx={{ p: 8, textAlign: "center", mt: 8 }}>
                <Typography variant="h5">Your Cart is Empty</Typography>
                <Button onClick={() => navigate("/")} variant="contained" sx={{ mt: 3 }}>Go to Home</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, lg: 8 }, bgcolor: "#f1f3f6", minHeight: "90vh", mt: 8 }}>
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                <Grid container spacing={3}>
                    <Grid item lg={8} md={8} sm={12} xs={12}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Delivery Address
                                </Typography>
                                {!isAddingNew && savedAddresses.length > 0 && (
                                    <Button size="small" onClick={() => setIsAddingNew(true)}>+ Add New</Button>
                                )}
                            </Box>
                            
                            {loadingAddresses ? (
                                <Box display="flex" justifyContent="center" p={3}><CircularProgress size={24} /></Box>
                            ) : isAddingNew ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Full Name*" name="name" value={newAddress.name} onChange={handleNewAddressChange} size="small" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Phone Number*" name="phone" value={newAddress.phone} onChange={handleNewAddressChange} size="small" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Pincode*" name="pincode" value={newAddress.pincode} onChange={handleNewAddressChange} size="small" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Locality" name="locality" value={newAddress.locality} onChange={handleNewAddressChange} size="small" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth multiline rows={2} label="Address (Area and Street)*" name="addressLine" value={newAddress.addressLine} onChange={handleNewAddressChange} size="small" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="City/District/Town*" name="city" value={newAddress.city} onChange={handleNewAddressChange} size="small" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="State*" name="state" value={newAddress.state} onChange={handleNewAddressChange} size="small" />
                                    </Grid>
                                    {savedAddresses.length > 0 && (
                                        <Grid item xs={12}>
                                            <Button variant="outlined" size="small" onClick={() => setIsAddingNew(false)}>Cancel</Button>
                                        </Grid>
                                    )}
                                </Grid>
                            ) : (
                                    savedAddresses.map(addr => (
                                        <Box key={addr.id} sx={{ border: selectedAddressId === addr.id ? "2px solid #2874f0" : "1px solid #f0f0f0", p: 2, mb: 1, borderRadius: 1, cursor: "pointer", position: "relative" }} onClick={() => setSelectedAddressId(addr.id)}>
                                            <RadioGroup value={selectedAddressId}>
                                                <FormControlLabel 
                                                    value={addr.id} 
                                                    control={<Radio checked={selectedAddressId === addr.id} />} 
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1" fontWeight={600}>{addr.name || addr.full_name} <Box component="span" sx={{ bgcolor: "#eee", px: 1, py: 0.2, borderRadius: 0.5, fontSize: "12px", ml: 1 }}>{addr.address_type || "HOME"}</Box></Typography>
                                                            <Typography variant="body2">{addr.address || addr.address_line}, {addr.locality || addr.city}</Typography>
                                                            <Typography variant="body2">{addr.city}, {addr.state} - {addr.postalCode || addr.pincode || addr.postal_code}</Typography>
                                                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>{addr.phone || addr.phone_number}</Typography>
                                                        </Box>
                                                    }
                                                />
                                            </RadioGroup>
                                            {selectedAddressId === addr.id && (
                                                <Button 
                                                    variant="contained" 
                                                    size="small" 
                                                    sx={{ mt: 2, bgcolor: "#fb641b", "&:hover": { bgcolor: "#e25a18" } }}
                                                    onClick={(e) => { e.stopPropagation(); proceedToPayment(); }}
                                                >
                                                    DELIVER HERE
                                                </Button>
                                            )}
                                        </Box>
                                    ))
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
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total Amount</Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2874f0" }}>₹{grandTotal.toLocaleString()}</Typography>
                            </Box>

                            <Button 
                                onClick={proceedToPayment} 
                                fullWidth 
                                variant="contained" 
                                sx={{ 
                                    backgroundColor: "#fb641b", 
                                    py: 1.5,
                                    fontSize: "16px", 
                                    fontWeight: "bold",
                                    "&:hover": { backgroundColor: "#e25a18" }
                                }}
                            >
                                CONTINUE
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Checkout;
