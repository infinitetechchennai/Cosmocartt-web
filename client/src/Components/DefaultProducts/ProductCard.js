
export const ProductCard = ({ props }) => {
    // Safely get title from different possible backend formats
    const productTitle = props.name || (props.title && props.title.longTitle) || "Product";
    
    // Safely get image and price info
    const imageUrl = props.image || props.url || "";
    const discount = props.discount || (props.price && props.price.discount) || (props.discount_percentage ? `${props.discount_percentage}% off` : "");
    const tagline = props.tagline || props.brand_name || "";

    return (
        <div className="product-card">
            <div className="product-card-img-container">
                <img src={imageUrl} alt={productTitle} />
            </div>
            
            <p className="product-title">
                {productTitle}
            </p>

            <p className="product-discount">
                {discount}
            </p>

            <p className="product-tagline">
                {tagline}
            </p>
        </div>
    )
}