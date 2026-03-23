import React, { useState, useEffect } from "react";
import { 
    Box, Typography, Button, Paper, Grid, List, ListItem, 
    ListItemIcon, ListItemText, Divider, TextField, Card, 
    CardContent, IconButton, CircularProgress, RadioGroup,
    FormControlLabel, Radio, Dialog, DialogTitle, DialogContent,
    DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile"); // profile, addresses
    const firstName = localStorage.getItem("firstName") || "Guest";
    const userName = localStorage.getItem("userName") || "";
    const userType = localStorage.getItem("userType") || "b2c";

    // Address States
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        name: "", phone: "", pincode: "", locality: "", 
        address: "", city: "", state: "", landmark: "", 
        address_type: "HOME", is_default: false, country: "India"
    });

    useEffect(() => {
        if (activeTab === "addresses") {
            fetchAddresses();
        }
    }, [activeTab]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.get("http://127.0.0.1:8000/users/addresses", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setAddresses(response.data.data || []);
        } catch (e) {
            console.error("Failed to fetch addresses", e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const handleTabChange = (tab) => {
        if (tab === "orders") {
            navigate("/orders");
            return;
        }
        setActiveTab(tab);
    };

    const handleOpenDialog = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                name: address.name || "",
                phone: address.phone || address.phone_number || "",
                pincode: address.pincode || "",
                locality: address.locality || "",
                address: address.address || address.address_line || "",
                city: address.city || "",
                state: address.state || "",
                landmark: address.landmark || "",
                address_type: address.address_type || "HOME",
                is_default: address.is_default || false,
                country: address.country || "India"
            });
        } else {
            setEditingAddress(null);
            setFormData({
                name: "", phone: "", pincode: "", locality: "", 
                address: "", city: "", state: "", landmark: "", 
                address_type: "HOME", is_default: false, country: "India"
            });
        }
        setDialogOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSaveAddress = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const payload = {
                ...formData,
                phone: formData.phone // Backend might expect specific name
            };

            if (editingAddress) {
                // The backend uses user_address_id in the URL
                const userAddrId = editingAddress.user_address_id; 
                await axios.put(`http://127.0.0.1:8000/users/addresses/${userAddrId}`, payload, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post("http://127.0.0.1:8000/users/addresses", payload, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setDialogOpen(false);
            fetchAddresses();
        } catch (e) {
            alert(e.response?.data?.detail || "Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (userAddrId) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`http://127.0.0.1:8000/users/addresses/${userAddrId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchAddresses();
        } catch (e) {
            alert("Failed to delete address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: "#f1f3f6", minHeight: "100vh", pt: 10, pb: 5 }}>
            <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
                <Grid container spacing={3}>
                    {/* Sidebar */}
                    <Grid item xs={12} md={3}>
                        <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
                            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff' }}>
                                <AccountCircleIcon sx={{ fontSize: 50, color: '#2874f0' }} />
                                <Box>
                                    <Typography variant="body2">Hello,</Typography>
                                    <Typography variant="h6" fontWeight={600}>{firstName}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        <Paper elevation={1} sx={{ mt: 2 }}>
                            <List sx={{ p: 0 }}>
                                <ListItem 
                                    button 
                                    selected={activeTab === "profile"} 
                                    onClick={() => handleTabChange("profile")}
                                    sx={{ py: 2, '&.Mui-selected': { bgcolor: '#f5faff', color: '#2874f0' } }}
                                >
                                    <ListItemIcon><AccountCircleIcon color={activeTab === "profile" ? "primary" : "inherit"} /></ListItemIcon>
                                    <ListItemText primary="Personal Information" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItem>
                                <Divider />
                                <ListItem 
                                    button 
                                    selected={activeTab === "addresses"} 
                                    onClick={() => handleTabChange("addresses")}
                                    sx={{ py: 2, '&.Mui-selected': { bgcolor: '#f5faff', color: '#2874f0' } }}
                                >
                                    <ListItemIcon><LocationOnIcon color={activeTab === "addresses" ? "primary" : "inherit"} /></ListItemIcon>
                                    <ListItemText primary="Manage Addresses" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItem>
                                <Divider />
                                <ListItem 
                                    button 
                                    onClick={() => handleTabChange("orders")}
                                    sx={{ py: 2 }}
                                >
                                    <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                                    <ListItemText primary="My Orders" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItem>
                                <Divider />
                                <ListItem 
                                    button 
                                    onClick={handleLogout}
                                    sx={{ py: 2, color: '#f00' }}
                                >
                                    <ListItemIcon><ExitToAppIcon sx={{ color: '#f00' }} /></ListItemIcon>
                                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    {/* Main Content */}
                    <Grid item xs={12} md={9}>
                        <Paper elevation={1} sx={{ p: 3, minHeight: '60vh' }}>
                            {activeTab === "profile" && (
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Personal Information</Typography>
                                    <Grid container spacing={3} sx={{ maxWidth: 600 }}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth label="First Name" value={firstName} disabled variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth label="Email Address" value={userName} disabled variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                                Account Type: <Box component="span" sx={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#2874f0' }}>{userType}</Box>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {activeTab === "addresses" && (
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Manage Addresses</Typography>
                                        <Button 
                                            variant="outlined" 
                                            startIcon={<AddIcon />} 
                                            onClick={() => handleOpenDialog()}
                                            sx={{ textTransform: 'none', fontWeight: 600 }}
                                        >
                                            ADD A NEW ADDRESS
                                        </Button>
                                    </Box>

                                    {loading && addresses.length === 0 ? (
                                        <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                                    ) : (
                                        <Box>
                                            {addresses.length === 0 ? (
                                                <Typography variant="body1" align="center" sx={{ color: '#878787', p: 5 }}>No addresses saved.</Typography>
                                            ) : (
                                                addresses.map((addr) => (
                                                    <Card key={addr.user_address_id} sx={{ mb: 2, border: '1px solid #f0f0f0', boxShadow: 'none' }}>
                                                        <CardContent sx={{ position: 'relative' }}>
                                                            {addr.is_default && (
                                                                <Box sx={{ position: 'absolute', top: 15, right: 15, bgcolor: '#f0f0f0', px: 1, py: 0.5, borderRadius: 0.5 }}>
                                                                    <Typography variant="caption" fontWeight={600}>DEFAULT</Typography>
                                                                </Box>
                                                            )}
                                                            <Typography variant="body2" sx={{ bgcolor: '#f0f0f0', width: 'fit-content', px: 1, py: 0.2, borderRadius: 0.5, mb: 1, fontSize: '10px', fontWeight: 'bold' }}>
                                                                {addr.address_type || "HOME"}
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600}>{addr.name} | {addr.phone || addr.pincode}</Typography>
                                                            <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>
                                                                {addr.address || addr.addressLine}, {addr.locality || ""}, {addr.city}, {addr.state} - <Box component="span" fontWeight={600}>{addr.pincode}</Box>
                                                            </Typography>
                                                            
                                                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                                                <IconButton size="small" onClick={() => handleOpenDialog(addr)} color="primary"><EditIcon /></IconButton>
                                                                <IconButton size="small" onClick={() => handleDeleteAddress(addr.user_address_id)} sx={{ color: '#f00' }}><DeleteIcon /></IconButton>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Address Form Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} pt={1}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Locality" name="locality" value={formData.locality} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Address (Area and Street)" name="address" value={formData.address} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="City/District/Town" name="city" value={formData.city} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Landmark (Optional)" name="landmark" value={formData.landmark} onChange={handleInputChange} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ mb: 1 }}>Address Type</Typography>
                            <RadioGroup row name="address_type" value={formData.address_type} onChange={handleInputChange}>
                                <FormControlLabel value="HOME" control={<Radio />} label="Home" />
                                <FormControlLabel value="WORK" control={<Radio />} label="Work" />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button 
                        onClick={handleSaveAddress} 
                        variant="contained" 
                        disabled={loading}
                        sx={{ textTransform: 'none', bgcolor: '#fb641b', '&:hover': { bgcolor: '#e25a18' } }}
                    >
                        {loading ? <CircularProgress size={24} /> : "SAVE"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile;
