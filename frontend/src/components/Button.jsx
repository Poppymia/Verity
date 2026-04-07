import React from 'react';
import '../styles/Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false,
  className = '',
  href,
  download,
  ...props 
}) => {
  const getButtonClass = () => {
    let classes = ['btn'];
    // Base class
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

  if (href) {
    return (
      <a
        className={getButtonClass()}
        href={disabled ? undefined : href}
        download={download}
        aria-disabled={disabled || undefined}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

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