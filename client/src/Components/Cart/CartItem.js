import { Button, ButtonGroup, Typography, Box, Divider, IconButton } from "@mui/material"
import { useDispatch } from "react-redux";
import { addToCart, deleteFromCart } from "../../Redux/Actions/cartActions";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export const CartItem = ({ item }) => {
    const dispatch = useDispatch();

    const removeItem = (id) => {
        dispatch(deleteFromCart(id));
    };

    const handleQuantity = (newQty) => {
        if (newQty > 0) {
            dispatch(addToCart(item.id, newQty));
        }
    };

    const cost = item.price?.cost || item.current_price || 0;
    const mrp = item.price?.mrp || item.b2c_price || cost;
    const discount = item.price?.discount || item.b2c_discount || "0%";

    return (
        <Box sx={{ py: 3, borderBottom: "1px solid #f0f0f0" }}>
            <Box sx={{ display: "flex", gap: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <img 
                        src={item.url || item.image || item.detailUrl} 
                        alt={item.title?.longTitle || item.name}
                        style={{ width: 100, height: 100, objectFit: "contain" }}
                    />
                    <ButtonGroup size="small">
                        <Button onClick={() => handleQuantity((item.quantity || 1) - 1)}>-</Button>
                        <Button sx={{ cursor: "default", "&:hover": { bgcolor: "transparent" } }}>{item.quantity || 1}</Button>
                        <Button onClick={() => handleQuantity((item.quantity || 1) + 1)}>+</Button>
                    </ButtonGroup>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                        {item.title?.longTitle || item.name}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Seller: cosmocartt
                    </Typography>

                    <Box display="flex" alignItems="baseline" gap={1} mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                            ₹{cost.toLocaleString()}
                        </Typography>
                        {mrp > cost && (
                            <Typography variant="body2" sx={{ color: "#878787", textDecoration: "line-through" }}>
                                ₹{mrp.toLocaleString()}
                            </Typography>
                        )}
                        {discount !== "0%" && (
                            <Typography variant="body2" sx={{ color: "#388E3C", fontWeight: 600 }}>
                                {discount} off
                            </Typography>
                        )}
                    </Box>

                    <Button 
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => removeItem(item.id)}
                        sx={{ color: "#212121", fontWeight: 600, "&:hover": { bgcolor: "transparent", color: "#2874f0" } }}
                    >
                        REMOVE
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}