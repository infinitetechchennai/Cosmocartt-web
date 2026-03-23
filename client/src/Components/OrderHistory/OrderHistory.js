import { useEffect, useState } from "react";
import NotLoginContainer from "./NotLoginContainer";
import axios from "axios";
import { 
    Button, Box, Typography, Divider, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, MenuItem, 
    CircularProgress, IconButton, Stack 
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { addEllipsis } from "../../utils/commonUtils";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
    const [isLogin, setLogin] = useState(true);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const username = localStorage.getItem("userName");

    const fetchOrderHistory = async () => {
        if (!username) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const config = {
                headers: {
                    "content-type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            }
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/user/${username}`, config)

            const items = [];
            if (response.data && response.data.orders) {
                response.data.orders.forEach(order => {
                    if (order.items) {
                        order.items.forEach(item => {
                            items.push({
                                ...item,
                                purchasedDate: order.date,
                                orderId: order.order_id,
                                orderStatus: order.status,
                                paymentStatus: order.payment_status
                            });
                        });
                    }
                });
            }
            setOrderItems(items);
        } catch (e) {
            console.log("Error", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!username) {
            setLogin(false);
        } else {
            fetchOrderHistory();
        }
    }, [username]);

    return (
        <div>
            {isLogin ? (
                <OrderHistoryArea 
                    orders={orderItems} 
                    fetchOrders={fetchOrderHistory} 
                    loading={loading}
                />
            ) : (
                <NotLoginContainer />
            )}
        </div>
    );
};

const OrderHistoryArea = ({ orders, fetchOrders, loading }) => {
    const navigate = useNavigate();
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [requestType, setRequestType] = useState('refund'); // refund or exchange
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const reasons = [
        "Defective product",
        "Wrong item received",
        "Quality not as expected",
        "Size/Fit issue",
        "Changed my mind",
        "Other"
    ];

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post(`${process.env.REACT_APP_API_URL}/orders/${orderId}/cancel`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            alert("Order cancelled successfully");
            fetchOrders();
        } catch (e) {
            alert(e.response?.data?.detail || "Failed to cancel order");
        }
    };

    const handleOpenReturnDialog = (item) => {
        setSelectedItem(item);
        setReturnDialogOpen(true);
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages([...e.target.files]);
        }
    };

    const handleSubmitReturn = async () => {
        if (!reason) {
            alert("Please select a reason");
            return;
        }
        if (images.length === 0) {
            alert("Please upload at least one image as proof");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("accessToken");
            const formData = new FormData();
            formData.append("order_item_id", selectedItem.order_item_id);
            formData.append("reason", reason);
            formData.append("details", details);
            formData.append("quantity", selectedItem.quantity || 1);
            
            images.forEach(image => {
                formData.append("images", image);
            });

            const endpoint = requestType === 'refund' ? 'refund' : 'exchange';
            if (requestType === 'refund') {
                formData.append("payment_method", "Original Source");
                formData.append("refund_amount", selectedItem.price * (selectedItem.quantity || 1));
            }

            await axios.post(`${process.env.REACT_APP_API_URL}/returns/${endpoint}`, formData, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert(`${requestType === 'refund' ? 'Return' : 'Exchange'} request submitted successfully`);
            setReturnDialogOpen(false);
            resetForm();
            fetchOrders();
        } catch (e) {
            alert(e.response?.data?.detail || `Failed to submit ${requestType} request`);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setReason('');
        setDetails('');
        setImages([]);
        setRequestType('refund');
    };

    if (loading && orders.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;
    }

    if (orders.length === 0) {
        return (
            <div className="empty-cart-container">
                <div className="empty-cart">
                    <img className="cart-img" src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="" />
                    <p className="cart-p">Missing Order History</p>
                    <p className="cart-p1">You Have not Purchased Anything Yet.</p>
                    <div className="place-order-container" style={{ boxShadow: "none" }}>
                        <Button onClick={() => navigate("/")} disableElevation variant="contained">Buy Items</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ margin: "100px 25px 25px 25px", boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px", backgroundColor: '#fff' }}>
            {orders.map((item, index) => (
                <Box key={`${item.orderId}-${index}`} sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
                    <div className="cart-item-container">
                        <div className="img-button-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <img className="cart-image-container" src={item.imageUrl || item.url} alt="" />
                        </div>

                        <div className="cart-text-container" style={{ flex: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                                <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        {addEllipsis(item.name || (item.title && item.title.longTitle))}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        OrderId: {item.orderId}
                                    </Typography>
                                </Box>
                                <Typography 
                                    sx={{ 
                                        fontWeight: 600, 
                                        color: item.orderStatus?.toLowerCase() === 'cancelled' ? 'error.main' : 'success.main',
                                        textTransform: 'capitalize' 
                                    }}
                                >
                                    ● {item.orderStatus}
                                </Typography>
                            </Box>

                            <p style={{ color: "#878787", fontSize: "14px", margin: "4px 0" }}>
                                Seller: Cosmocrartt 
                            </p>

                            <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "start" }}>
                                <p style={{ margin: 0 }}>Purchased for</p>
                                <p style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>₹ {(item.price?.cost || item.price).toLocaleString()}</p>
                                <p style={{ margin: 0 }}>on {item.purchasedDate}</p>
                            </div>

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
                                {(item.orderStatus?.toLowerCase() === 'ordered' || item.orderStatus?.toLowerCase() === 'pending') && (
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        size="small"
                                        onClick={() => handleCancelOrder(item.orderId)}
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                                {item.orderStatus?.toLowerCase() === 'delivered' && 
                                 !['returned', 'partial_returned', 'exchanged', 'partial_exchanged'].includes(item.status?.toLowerCase()) && (
                                    <Button 
                                        variant="outlined" 
                                        color="primary" 
                                        size="small"
                                        onClick={() => handleOpenReturnDialog(item)}
                                    >
                                        Return / Exchange
                                    </Button>
                                )}
                                {['returned', 'partial_returned'].includes(item.status?.toLowerCase()) && (
                                    <Typography variant="body2" sx={{ color: '#ff6161', fontWeight: 600, bgcolor: '#fff0f0', px: 1, py: 0.5, borderRadius: 1 }}>
                                        Return Requested
                                    </Typography>
                                )}
                                {['exchanged', 'partial_exchanged'].includes(item.status?.toLowerCase()) && (
                                    <Typography variant="body2" sx={{ color: '#2874f0', fontWeight: 600, bgcolor: '#f0f5ff', px: 1, py: 0.5, borderRadius: 1 }}>
                                        Exchange Requested
                                    </Typography>
                                )}
                            </Stack>
                        </div>
                    </div>
                </Box>
            ))}

            {/* Return/Exchange Dialog */}
            <Dialog open={returnDialogOpen} onClose={() => !submitting && setReturnDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Request Return or Exchange
                    <IconButton
                        aria-label="close"
                        onClick={() => setReturnDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                        disabled={submitting}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedItem && (
                        <Box sx={{ mb: 2, display: 'flex', gap: 2, bgcolor: '#f9f9f9', p: 1.5, borderRadius: 1 }}>
                            <img src={selectedItem.imageUrl} alt="" style={{ width: 50, height: 50, objectFit: 'contain' }} />
                            <Box>
                                <Typography variant="body2" fontWeight={600}>{selectedItem.name}</Typography>
                                <Typography variant="caption" color="textSecondary">Qty: {selectedItem.quantity}</Typography>
                            </Box>
                        </Box>
                    )}

                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Request Type</Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                        <Button 
                            variant={requestType === 'refund' ? 'contained' : 'outlined'} 
                            onClick={() => setRequestType('refund')}
                            size="small"
                        >
                            Return (Refund)
                        </Button>
                        <Button 
                            variant={requestType === 'exchange' ? 'contained' : 'outlined'} 
                            onClick={() => setRequestType('exchange')}
                            size="small"
                        >
                            Exchange
                        </Button>
                    </Stack>

                    <TextField
                        select
                        fullWidth
                        label="Reason for return/exchange"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        margin="normal"
                        size="small"
                    >
                        {reasons.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Additional Details (Optional)"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        margin="normal"
                        size="small"
                        placeholder="Please describe the issue in detail..."
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Upload Proof Images (Required)</Typography>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="return-images"
                            multiple
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="return-images">
                            <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} fullWidth>
                                Select Images
                            </Button>
                        </label>
                        {images.length > 0 && (
                            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                                {images.length} image(s) selected
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setReturnDialogOpen(false)} disabled={submitting}>Cancel</Button>
                    <Button 
                        onClick={handleSubmitReturn} 
                        variant="contained" 
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default OrderHistory;