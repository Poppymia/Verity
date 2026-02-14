import React from 'react';
import '../styles/Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const getButtonClass = () => {
    let classes = ['btn'];
    
    // Variant classes
    if (variant === 'primary') classes.push('btn-primary');
    else if (variant === 'secondary') classes.push('btn-secondary');
    else if (variant === 'white') classes.push('btn-white');
    
    // Size classes
    if (size === 'large') classes.push('btn-large');
    
    // Additional classes
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <button 
      className={getButtonClass()} 
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;