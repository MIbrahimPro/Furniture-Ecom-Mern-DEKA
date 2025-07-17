// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [mainImg, setMainImg] = useState("");

    useEffect(() => {
        axios.get(`/api/products/${id}`)
            .then(({ data }) => {
                setProduct(data);
                setMainImg(`/${data.images[0]}`);
            })
            .catch(() => navigate("/not-found"));
    }, [id, navigate]);

    if (!product) return null;

    const themeColor = product.theme.color;

    return (
        <div className="product-detail">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="back-btn"
                style={{ color: themeColor }}
            >
                &larr; Back
            </button>

            <div className="detail-grid">
                {/* Image Gallery */}
                <div className="gallery">
                    <img src={mainImg} alt={product.name} className="main-img" />
                    <div className="thumbs">
                        {product.images.map((img, i) => (
                            <img
                                key={i}
                                src={`/${img}`}
                                alt={`${product.name} ${i}`}
                                className={`thumb ${mainImg === `/${img}` ? "selected" : ""}`}
                                onClick={() => setMainImg(`/${img}`)}
                            />
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="info">
                    <h1
                        className="name"
                        style={{ fontFamily: "MyFont", color: themeColor }}
                    >
                        {product.name}
                    </h1>
                    <p className="desc">{product.description}</p>
                    <p className="price">${product.price.toFixed(2)}</p>

                    <div className="specs">
                        <p><strong>Brand:</strong> {product.brand}</p>
                        <p><strong>Color:</strong> {product.color}</p>
                        <p><strong>Dimensions:</strong> {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} cm</p>
                        <p><strong>Weight:</strong> {product.weight} g</p>
                    </div>

                    <button
                        onClick={() =>
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                img: mainImg,
                            })
                        }
                        className="add-cart-btn"
                        style={{ backgroundColor: themeColor }}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
