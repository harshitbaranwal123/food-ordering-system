import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <div className="header" role="banner">
      <div className="header-contents">
        <span className="header-badge">🍽️ #1 Food Delivery</span>
        <h2>Order your favourite food—fast, fresh, and just right.</h2>
        <p>
          Choose from a diverse menu featuring a detectable array of dishes
          crafted with the finest ingredients and culinary expertise. Our
          mission is to satisfy your cravings and elevate your dining
          experience, one delicious meal at a time.
        </p>
        <button className="header-cta">View Menu</button>
      </div>
    </div>
  );
};

export default Header;

