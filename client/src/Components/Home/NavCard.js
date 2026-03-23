import "../styles.css"
import React from "react";
import { useNavigate } from "react-router-dom";

const NavCard = ({ props }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navigate to discover page with category filter
        navigate(`/discover?category=${encodeURIComponent(props.type)}`);
    };

    return (
        <div className="navcard-container" onClick={handleClick} style={{ cursor: 'pointer' }}>
            <img src={props.img} alt={props.type} />
            <p>{props.type}</p>
        </div>
    )
}

export default NavCard;