import "../styles.css"
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

export const bannerData = [
    { id: 1, url: 'https://rukminim1.flixcart.com/flap/3376/560/image/d117a62eb5fbb8e1.jpg?q=50' },
    { id: 2, url: 'https://rukminim1.flixcart.com/flap/3376/560/image/57267a180af306fe.jpg?q=50' },
    { id: 3, url: 'https://rukminim1.flixcart.com/flap/3376/560/image/ae9966569097a8b7.jpg?q=50' },
    { id: 4, url: 'https://rukminim1.flixcart.com/flap/3376/560/image/f6202f13b6f89b03.jpg?q=50' }
]

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 1,
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1,
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1
      }
};

const Banner = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const config = {
                    headers: {
                        "Authorization": token ? `Bearer ${token}` : ""
                    }
                }
                const response = await axios.get("http://127.0.0.1:8000/hero-banners", config);
                if (response.data && response.data.success) {
                    setBanners(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching hero banners:", error);
                // Fallback to dummy data if fetch fails
                setBanners(bannerData.map(b => ({ id: b.id, image_url: b.url })));
            }
        };

        fetchBanners();
    }, []);

    // If no banners yet, don't render empty carousel
    if (banners.length === 0) return null;

    return (
        <div className="carousel-container">
            <Carousel 
                responsive={responsive} 
                swipeable={false} 
                draggable={false} 
                infinite={true} 
                autoPlay={true}
                autoPlaySpeed={4000}
                keyBoardControl={true}
                showDots={true}
            >
                {banners.map(banner => (
                    <img 
                        style={{
                            width: "100%",
                            height: "280px",
                            objectFit: "cover"
                        }} 
                        key={banner.id} 
                        src={banner.image_url} 
                        alt={banner.title || "Banner Image"} 
                    />
                ))}
            </Carousel>
        </div>
    );
}

export default Banner;