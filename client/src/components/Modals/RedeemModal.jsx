import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaTimes, 
  FaShoppingCart, 
  FaStore, 
  FaGift, 
  FaBus, 
  FaBook, 
  FaUtensils, 
  FaCookieBite, 
  FaMugHot, 
  FaLandmark,
  FaTrain
} from 'react-icons/fa';
import { GiTwoCoins } from "react-icons/gi";
import UniversalModal from './UniversalModal';
import './RedeemModal.css';

// THE UPDATE: The offer list is now specific to Pune
const puneOffers = [
    { name: "Vaishali, FC Road", offer: "10% Off on Total Bill", cost: 0, icon: <FaUtensils /> },
    { name: "Bedekar Misal", offer: "Free Solkadhi with Misal", cost: 0, icon: <FaMugHot /> },
    { name: "Kayani Bakery", offer: "₹50 Off on Shrewsbury Biscuits", cost: 0, icon: <FaCookieBite /> },
    { name: "Chitale Bandhu", offer: "10% Discount on Bhakarwadi", cost: 0, icon: <FaStore /> },
    { name: "Marz-O-Rin, MG Road", offer: "Buy 1 Get 1 Free Sandwich", cost: 0, icon: <FaGift /> },
    { name: "Goodluck Cafe", offer: "Free Bun Maska with Chai", cost: 0, icon: <FaMugHot /> },
    { name: "Shaniwar Wada Entry", offer: "20% Off Entry Ticket", cost: 0, icon: <FaLandmark /> },
    { name: "Pune Metro Ride", offer: "One Free Short-Distance Ride", cost: 0, icon: <FaTrain /> },
    // Kept as requested
    { name: "Local Bus Pass (PMPML)", offer: "₹100 Off Monthly Pass", cost: 0, icon: <FaBus /> },
    { name: "City Library Membership", offer: "20% Off Annual Fee", cost: 0, icon: <FaBook /> }
];

const RedeemModal = ({ isOpen, onClose, currentCoins }) => {
  const [cart, setCart] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.cost, 0);
    setTotalCost(newTotal);
  }, [cart]);

  const addToCart = (offer) => {
    setCart(prevCart => [...prevCart, offer]);
  };

  const removeFromCart = (offerName) => {
    setCart(prevCart => prevCart.filter(item => item.name !== offerName));
  };

  const handleRedeemCart = () => {
    toast.success(
        <div>
            <h3>🎉 Redemption Successful!</h3>
            <p>Your coupons have been generated. Thank you for keeping Pune clean!</p>
        </div>, 
        { autoClose: 5000 }
    );
    setCart([]);
    onClose();
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="redeem-modal-content">
        <div className="modal-header">
          <h2>Redeem Your CleanCoins</h2>
          <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
        </div>
        <div className="redeem-body">
            <div className="offers-grid">
                {puneOffers.map(offer => {
                    const isInCart = cart.some(item => item.name === offer.name);
                    return (
                        <div key={offer.name} className={`offer-card ${isInCart ? 'in-cart' : ''}`}>
                            <div className="offer-icon">{offer.icon}</div>
                            <h4 className="offer-name">{offer.name}</h4>
                            <p className="offer-details">{offer.offer}</p>
                            <button 
                                className="btn btn-add-cart" 
                                disabled={isInCart}
                                onClick={() => addToCart(offer)}
                            >
                                {isInCart ? 'Added' : 'Add to Cart'}
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="cart-summary">
                <h3><FaShoppingCart /> Your Cart</h3>
                <div className="current-coins-display">
                    You have <span className="coin-total">{currentCoins}</span> CleanCoins
                </div>
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <p className="empty-cart-text">Select offers to add them here.</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.name} className="cart-item">
                                <span className="cart-item-name">{item.name}</span>
                                <div className="cart-item-details">
                                    <span className="cart-item-cost"><GiTwoCoins /> {item.cost}</span>
                                    <button onClick={() => removeFromCart(item.name)} className="btn-remove-item"><FaTrash /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="cart-footer">
                    <div className="total-cost">
                        <span>Total:</span>
                        <span className="total-cost-amount"><GiTwoCoins /> {totalCost}</span>
                    </div>
                    <button 
                        className="btn btn-redeem-all"
                        disabled={cart.length === 0 || totalCost > currentCoins}
                        onClick={handleRedeemCart}
                    >
                        Redeem {cart.length} Item(s)
                    </button>
                </div>
            </div>
        </div>
      </div>
    </UniversalModal>
  );
};

export default RedeemModal;