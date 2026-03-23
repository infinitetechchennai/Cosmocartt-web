import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
    const theme = useTheme();
    // Only target screens sm or smaller (approx < 600px)
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    
    // Set value based on current URL
    const getTabValue = (pathname) => {
        if (pathname === '/') return 0;
        if (pathname === '/discover') return 1;
        if (pathname === '/cart') return 2;
        if (pathname === '/profile') return 3;
        return 0;
    };

    const [value, setValue] = useState(getTabValue(location.pathname));

    useEffect(() => {
        setValue(getTabValue(location.pathname));
    }, [location.pathname]);

    // If not mobile device view, hide the bottom nav entirely
    if (!isMobile) return null;

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    if (newValue === 0) navigate("/");
                    if (newValue === 1) navigate("/discover");
                    if (newValue === 2) navigate("/cart");
                    if (newValue === 3) navigate("/profile");
                }}
                sx={{
                    "& .Mui-selected": {
                        color: "#2874f0"
                    }
                }}
            >
                <BottomNavigationAction label="Home" icon={<HomeIcon />} />
                <BottomNavigationAction label="Discover" icon={<SearchIcon />} />
                <BottomNavigationAction label="Cart" icon={<ShoppingCartIcon />} />
                <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;
