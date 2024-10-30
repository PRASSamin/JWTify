import React, { useState } from "react";
import "./ripple.css"; // Import the CSS file containing the styles

const RippleButton = ({ children, className = "", rippleClass = "", onClick }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (typeof onClick === "function") {
      onClick();
    }

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: new Date().getTime() };
    setRipples([...ripples, newRipple]);

    setTimeout(() => {
      setRipples((currentRipples) =>
        currentRipples.filter((ripple) => ripple.id !== newRipple.id)
      );
    }, 1250);
  };

  return (
    <button className={`ripple-button ${className} ti-btn`} onClick={handleClick}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={`ripple ${rippleClass}`}
          style={{ top: ripple.y, left: ripple.x }}
        />
      ))}
    </button>
  );
};

export default RippleButton;
