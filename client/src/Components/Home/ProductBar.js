import NavCard from "./NavCard"
import "../styles.css"
import React from "react";

const ProductBar = () => {
    const categories = [
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/22fddf3c7da4c4f4.png?q=100",
            type: "All Gadgets",
        },
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/22fddf3c7da4c4f4.png?q=100",
            type: "Mobile & Devices",
        },
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/69c6589653afdb9a.png?q=100",
            type: "Laptops & PCs",
        },
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/69c6589653afdb9a.png?q=100",
            type: "Cameras & Photography",
        },
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/ab7e2b022a4587dd.jpg?q=100",
            type: "Wearables",
        },
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/0139228b2f7eb413.jpg?q=100",
            type: "TV & Entertainment",
        },
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/71050627a56b4693.png?q=100",
            type: "Networking",
        },
        {
            img: "https://rukminim1.flixcart.com/flap/80/80/image/dff3f7adcf3a90c6.png?q=100",
            type: "Peripherals",
        }
    ];

    return (
        <div className="nav-items-container">
            {categories.map((category) => <NavCard key={category.type} props={category} />)}
        </div>
    );
}

export default ProductBar;