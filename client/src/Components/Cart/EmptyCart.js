import { Box, Typography, Button, Paper } from "@mui/material"
import { useNavigate } from "react-router-dom"
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const EmptyCart = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: { xs: 2, lg: 8 }, bgcolor: "#f1f3f6", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", mt: 8 }}>
            <Paper elevation={0} sx={{ p: 5, textAlign: "center", maxWidth: 600, width: "100%" }}>
                <Box sx={{ mb: 3 }}>
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 100, color: "#2874f0", opacity: 0.2 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Your cart is empty!
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Add items to it now.
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => navigate("/")}
                    sx={{ 
                        bgcolor: "#2874f0", 
                        px: 5, 
                        py: 1.5,
                        '&:hover': { bgcolor: "#1262d1" }
                    }}
                >
                    Shop Now
                </Button>
            </Paper>
        </Box>
    )
}

export default EmptyCart;